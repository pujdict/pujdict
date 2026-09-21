<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form onsubmit="return false;">
      <div class="row g-2">
        <div class="form-group">
          <label for="convert-input">输入需要转换的文字：</label>
          <textarea class="form-control" id="convert-input" rows="3"
                    v-model="convertInput"></textarea>
        </div>
        <div class="btn-toolbar">
          <div class="btn-group">
            <input id="query-button" class="btn btn-outline-primary" type="submit" value="转换" @click="convertAction"/>
            <input id="reset-button" class="btn btn-outline-danger" type="button" value="重置" @click="resetAction"/>
          </div>
        </div>
        <div class="form-group" v-if="lines.length">
          <label>注音与连调标注：</label>
          <div class="pu-lines">
            <div class="pu-line" v-for="(line, lineIndex) in lines" :key="lineIndex">
              <template v-for="(item, index) in line" :key="item.key">
                <span v-if="!item.isHan" class="pu-literal"
                      :class="item.isPunct ? 'pu-literal-punct' : ''"
                      :title="item.isQuote ? '引号：导出为 \&quot;，且不分隔连调组'
                              : (item.isPunct ? '标点：自动分隔连调组' : '')">{{ item.char }}</span>
                <template v-else>
                <div v-if="isGroupStart(line, index)" class="pu-edge"
                     title="勾选：本连调组之前有本调 Ｘ（虚拟），组内全是后变调 Ｚ">
                  <div class="form-check pu-check">
                    <input class="form-check-input" type="checkbox" :checked="item.xBefore"
                           @change="setEdgeX(lineIndex, index, 'before', $event.target.checked)"/>
                    <label class="form-check-label pu-check-label">X</label>
                  </div>
                </div>
                <div class="pu-item">
                  <div class="pu-char">
                    <span class="pu-pos" :class="'pu-pos-' + (positionOf(line, index) || 'none')"
                    >{{ positionOf(line, index) }}</span>
                    <span>{{ item.char }}</span>
                  </div>
                  <div class="pu-pinyin">
                    <div v-if="item.isPolyphonic" class="dropdown d-inline-block">
                        <span class="text-primary dropdown-toggle pu-py-toggle" data-bs-toggle="dropdown"
                              title="点击选择其他读音"
                        >{{ displayPUJ(item) }}</span>
                      <ul class="dropdown-menu">
                        <li v-for="(cand, idx) in item.candidates" :key="idx">
                          <a class="dropdown-item" href="#" @click.prevent="selectPinyin(lineIndex, index, idx)">
                            {{ cand.puj }}
                            <span v-if="catLabel(cand.cat)" class="pu-cat" :class="'pu-cat-' + cand.cat"
                            >{{ catLabel(cand.cat) }}</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                    <span v-else-if="item.candidates.length">{{ displayPUJ(item) }}</span>
                    <input v-else class="form-control form-control-sm pu-input" type="text"
                           placeholder="?" title="字库中没有该字，请手工填写拼音"
                           :value="item.currentPUJ"
                           @input="setCustomPinyin(lineIndex, index, $event.target.value)"/>
                  </div>
                  <div class="form-check pu-check" title="勾选表示此字读本调（Ｘ）">
                    <input class="form-check-input" type="checkbox" :checked="item.isX"
                           @change="setX(lineIndex, index, $event.target.checked)"/>
                    <label class="form-check-label pu-check-label">X</label>
                  </div>
                </div>
                <div v-if="isGroupEnd(line, index)" class="pu-edge"
                     title="勾选：本连调组之后有本调 Ｘ（虚拟），组内全是前变调 Ｙ；若同时勾选末字，则末字为重读前变调 Ｗ">
                  <div class="form-check pu-check">
                    <input class="form-check-input" type="checkbox" :checked="item.xAfter"
                           @change="setEdgeX(lineIndex, index, 'after', $event.target.checked)"/>
                    <label class="form-check-label pu-check-label">X</label>
                  </div>
                </div>
                </template>
                <div v-if="hasGapButtons(line, index)" class="pu-gap">
                  <button type="button"
                          class="btn btn-sm pu-gap-btn"
                          :class="item.breakAfter ? 'btn-primary' : 'btn-outline-secondary'"
                          title="添加／取消连调组边界 /"
                          @click="toggleBreak(lineIndex, index)">/</button>
                  <button type="button"
                          class="btn btn-sm pu-gap-btn"
                          :class="item.wordJoin ? 'btn-success' : 'btn-outline-secondary'"
                          title="添加／取消分词边界 _"
                          @click="toggleWord(lineIndex, index)">_</button>
                </div>
              </template>
            </div>
          </div>
          <div class="form-text pu-help">
            点击两字之间的 <code>/</code> 按钮添加连调组边界（再点取消），添加时 <code>/</code> 之前的一个字自动勾选为本调 <b>Ｘ</b>。<br/>
            每个字下方的复选框用于标记本调 <b>Ｘ</b>；连续勾选两个字时，后一个为 <b>Ｘ</b>，前一个为重读前变调 <b>Ｗ</b>。
            标记后，同组内 Ｘ 之前的字自动为 <b>Ｙ</b>（前变调），之后的字自动为 <b>Ｚ</b>（后变调／轻声）。<br/>
            每个连调组首尾各有一个额外的 <b>Ｘ</b> 复选框，用于标出组外（虚拟）的本调：
            勾选<b>组首之前</b>的 Ｘ，表示本调在组之前，组内全是 <b>Ｚ</b>（全轻声调）；
            勾选<b>组末之后</b>的 Ｘ，表示本调在组之后，组内全是 <b>Ｙ</b>（全前变调）；
            若同时勾选组末之后的 Ｘ 与末字本身的 Ｘ，则末字为 <b>Ｗ</b>。<br/>
            点击两字之间的 <code>_</code> 按钮，可标记这两个字属于同一个词（再点取消）；已连写的两个拼音在导出时用 <code>_</code> 相连。<br/>
            标点（含西文标点）自动分隔连调组，且标点之前的最后一个汉字自动勾选为 <b>Ｘ</b>；
            若句中／句末没有收尾标点，则该行最后一个汉字也自动勾选为 <b>Ｘ</b>。<br/>
            引号 <code>“”</code> <code>《》</code> <code>「」</code> <code>『』</code> <code>〈〉</code>
            一律导出为 <code>"</code>，且视为透明——不分隔连调组，也不会在其前自动勾选 Ｘ。<br/>
            修改输入文字后再次点击「转换」，已标注的部分会尽量保留。
          </div>
        </div>
        <div class="form-group" v-if="lines.length">
          <label for="convert-result">转换结果：</label>
          <textarea class="form-control" id="convert-result" rows="3" readonly
                    v-model="finalPUJ"></textarea>
          <div class="form-text">
            <code>/</code> 为连调组边界，<code>*</code> 表示该字读本调（Ｘ），<code>_</code> 连接同一个词内部的两个音节。
            单独成词的 <code>*</code> 表示本调在该连调组之外（组之前或组之后）。
            中文标点导出时转为西文标点。
          </div>
          <div class="btn-toolbar mt-2">
            <div class="btn-group">
              <button type="button" class="btn btn-outline-primary" @click="copyAction">
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
            <div class="form-check ms-3 d-flex align-items-center">
              <input class="form-check-input" type="checkbox" id="output-as-plain" v-model="outputAsPlain"/>
              <label class="form-check-label" for="output-as-plain">导出为数字调形式</label>
            </div>
            <div class="form-check ms-3 d-flex align-items-center">
              <input class="form-check-input" type="checkbox" id="output-punct" v-model="outputPunct"/>
              <label class="form-check-label" for="output-punct">导出标点符号</label>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
</script>
<script>
import {
  addPUJToneMarkAndConvertToDisplayPUJSentence,
} from "./SPuj";
import {
  initFromDatabase,
  setLoading,
  db,
  isChineseChar,
} from './QCommon.vue';

import jquery from 'jquery';

const $ = jquery;

// 文白异读标记（EntryCategory）
const CatLabels = {1: '白', 2: '文', 3: '俗'};

const WordLikeRegex = /[\p{L}\p{N}']/u;

// 中文标点 → 西文标点。导出时不输出中文标点。
const PunctMap = Object.assign(Object.create(null), {
  '，': ',', '、': ',', '；': ';', '：': ':', '。': '.', '？': '?', '！': '!',
  '（': '(', '）': ')',
  '【': '[', '】': ']', '〔': '[', '〕': ']',
  // 各种引号、书名号一律输出为英文双引号
  '《': '"', '》': '"', '〈': '"', '〉': '"',
  '「': '"', '」': '"', '『': '"', '』': '"',
  '“': '"', '”': '"', '‘': '"', '’': '"',
  '—': '-', '－': '-', '～': '~', '…': '...', '·': '.',
});

// 引号类标点：导出为 "，且视为透明，不分隔连调组。
const QuoteChars = '《》〈〉「」『』“”‘’"';
const QuoteOpenChars = '《〈「『“‘';
const QuoteCloseChars = '》〉」』”’';
const isQuoteChar = (ch) => ch.length === 1 && QuoteChars.indexOf(ch) !== -1;

function toWesternPunct(token) {
  let result = '';
  for (const ch of token) {
    result += PunctMap[ch] ?? ch;
  }
  return result;
}

let keyCounter = 0;

// 将一行文字切成若干 token：汉字各自成 token，连续的西文/数字合并为一个 token，
// 标点符号各自成 token（中文或西文标点均作为连调组边界）。
function tokenizeLine(line) {
  const tokens = [];
  let buffer = '';
  const flush = () => {
    if (buffer) {
      tokens.push(buffer);
      buffer = '';
    }
  };
  for (const ch of line) {
    if (/\s/.test(ch)) {
      flush();
    } else if (isChineseChar(ch)) {
      flush();
      tokens.push(ch);
    } else if (WordLikeRegex.test(ch)) {
      buffer += ch;
    } else {
      // 标点单独成 token
      flush();
      tokens.push(ch);
    }
  }
  flush();
  return tokens;
}

// 查字库，返回该汉字全部读音（已去重，按 频率 → 文白 → 字序 排序）。
function getHanCharPUJCandidates(han) {
  const indices = db?.entriesCharMap?.get(han);
  if (!indices) return [];
  const entries = [...indices].map(i => db.entries[i]).filter(entry => entry && entry.pron);
  entries.sort((entry1, entry2) => {
    if ((entry1.freq || 0) !== (entry2.freq || 0))
      return (entry1.freq || 0) - (entry2.freq || 0);
    if ((entry1.cat || 0) !== (entry2.cat || 0))
      return (entry1.cat || 0) - (entry2.cat || 0);
    return (entry1.index || 0) - (entry2.index || 0);
  });
  const seen = new Set();
  const result = [];
  for (const entry of entries) {
    const plain = `${entry.pron.initial}${entry.pron.final}${entry.pron.tone}`;
    if (seen.has(plain)) continue;
    seen.add(plain);
    result.push({
      plain,
      puj: addPUJToneMarkAndConvertToDisplayPUJSentence(plain),
      cat: entry.cat || 0,
      freq: entry.freq || 0,
    });
  }
  return result;
}

function createItem(token) {
  const isHan = isChineseChar(token);
  const isQuote = isQuoteChar(token);
  const item = {
    key: ++keyCounter,
    char: token,
    isHan,
    isPunct: !WordLikeRegex.test(token),
    isQuote,
    // 是否为右引号（紧贴前一个音节）。左右成对的引号可静态判定，
    // 英文 " 需要结合上下文判定，见 resolveQuoteDirection()。
    isQuoteClose: isQuote && QuoteCloseChars.indexOf(token) !== -1,
    isQuoteAmbiguous: isQuote && QuoteOpenChars.indexOf(token) === -1
        && QuoteCloseChars.indexOf(token) === -1,
    candidates: [],
    currentPUJ: '',
    currentPlain: '',
    isPolyphonic: false,
    isX: false,
    // 连调组首字：组之前存在虚拟 Ｘ，组内全为后变调 Ｚ（全轻声调）
    xBefore: false,
    // 连调组末字：组之后存在虚拟 Ｘ，组内全为前变调 Ｙ；若末字也为 Ｘ 则末字为 Ｗ
    xAfter: false,
    breakAfter: false,
    // 与后一个字属于同一个词
    wordJoin: false,
  };
  if (!isHan) {
    item.currentPUJ = token;
    item.currentPlain = token;
    return item;
  }
  item.candidates = getHanCharPUJCandidates(token);
  item.isPolyphonic = item.candidates.length > 1;
  if (item.candidates.length) {
    item.currentPUJ = item.candidates[0].puj;
    item.currentPlain = item.candidates[0].plain;
  }
  return item;
}

export default {
  data() {
    return {
      convertInput: '',
      // 每行是一个 item 数组；item 对应一个汉字或一个非汉字 token（标点、西文等）。
      lines: [],
      outputAsPlain: false,
      outputPunct: true,
      copied: false,
    }
  },
  computed: {
    finalPUJ() {
      return this.lines.map(line => this.exportLine(line)).join('\n');
    }
  },
  methods: {
    catLabel(cat) {
      return CatLabels[cat] ?? '';
    },
    displayPUJ(item) {
      return this.outputAsPlain ? item.currentPlain : item.currentPUJ;
    },
    // 连调组：汉字序列，遇 / 边界或非汉字 token 即断开。
    // 引号是透明的，不分隔连调组。
    groupsOf(line) {
      const groups = [];
      let current = [];
      line.forEach((item, index) => {
        if (!item.isHan) {
          if (item.isQuote) return;
          if (current.length) {
            groups.push(current);
            current = [];
          }
          return;
        }
        current.push(index);
        if (item.breakAfter) {
          groups.push(current);
          current = [];
        }
      });
      if (current.length) groups.push(current);
      return groups;
    },
    groupOf(line, index) {
      return this.groupsOf(line).find(group => group.includes(index)) ?? [];
    },
    // 是否为所在连调组的首字／末字（决定两端的虚拟 Ｘ 复选框是否显示）
    isGroupStart(line, index) {
      const group = this.groupOf(line, index);
      return group.length > 0 && group[0] === index;
    },
    isGroupEnd(line, index) {
      const group = this.groupOf(line, index);
      return group.length > 0 && group[group.length - 1] === index;
    },
    // 声调地位（见 src/doc/hyphens.md）：
    // 勾选的字中最靠后的一个为本调 Ｘ；若 Ｘ 的前一个字也被勾选，则该字为重读前变调 Ｗ；
    // Ｗ 之前（含未被勾选的前邻）为前变调 Ｙ，Ｘ 之后为后变调 Ｚ。
    // 组内没有勾选 X 时视为尚未标注，返回空串。
    positionOf(line, index) {
      const item = line[index];
      if (!item || !item.isHan) return '';
      const group = this.groupOf(line, index);
      if (!group.length) return '';
      const first = group[0], last = group[group.length - 1];
      // 虚拟 Ｘ 在组之前：组内没有本调，所有字都是后变调 Ｚ（全轻声调）
      if (line[first].xBefore) return 'Z';
      // 虚拟 Ｘ 在组之后：组内所有字都是前变调 Ｙ（全前变调）；
      // 若末字同时被标记为 Ｘ，则末字为重读前变调 Ｗ。
      if (line[last].xAfter) {
        if (index === last && line[last].isX) return 'W';
        return 'Y';
      }
      const checked = group.filter(i => line[i].isX);
      if (!checked.length) return '';
      const xIndex = checked[checked.length - 1];
      if (index === xIndex) return 'X';
      if (index === xIndex - 1 && checked.includes(xIndex - 1)) return 'W';
      return index < xIndex ? 'Y' : 'Z';
    },
    hasGapButtons(line, index) {
      const next = line[index + 1];
      return line[index].isHan && next !== undefined && next.isHan;
    },
    toggleBreak(lineIndex, index) {
      const line = this.lines[lineIndex];
      const item = line[index];
      item.breakAfter = !item.breakAfter;
      if (item.breakAfter) {
        // 新添加的 / 之前的一个字默认为该连调组的本调 Ｘ。
        const group = this.groupOf(line, index);
        line[group[0]].xBefore = false;
        for (const i of group) {
          line[i].isX = (i === index);
        }
      }
    },
    toggleWord(lineIndex, index) {
      const item = this.lines[lineIndex][index];
      item.wordJoin = !item.wordJoin;
    },
    // 连调组两端的虚拟 Ｘ：'before' 表示 Ｘ 在组之前，'after' 表示 Ｘ 在组之后。
    setEdgeX(lineIndex, index, edge, value) {
      const line = this.lines[lineIndex];
      const group = this.groupOf(line, index);
      if (!group.length) return;
      const last = group[group.length - 1];
      if (edge === 'before') {
        line[group[0]].xBefore = value;
        // 组内全是 Ｚ，不能再有本调 Ｘ
        if (value) for (const i of group) line[i].isX = false;
      } else {
        line[last].xAfter = value;
        // 组内全是 Ｙ；之后再勾选末字，末字即为 Ｗ。
        if (value) for (const i of group) line[i].isX = false;
      }
    },
    setX(lineIndex, index, isX) {
      const line = this.lines[lineIndex];
      line[index].isX = isX;
      if (!isX) return;
      const group = this.groupOf(line, index);
      if (!group.length) return;
      const last = group[group.length - 1];
      // 与组两端的虚拟 Ｘ 互斥：组前已有虚拟 Ｘ 时组内不该再有本调；
      // 组后有虚拟 Ｘ 时，只有末字可以保留本调（即 Ｗ）。
      line[group[0]].xBefore = false;
      if (index !== last) line[last].xAfter = false;
    },
    selectPinyin(lineIndex, index, candidateIndex) {
      const item = this.lines[lineIndex][index];
      const candidate = item.candidates[candidateIndex];
      item.currentPUJ = candidate.puj;
      item.currentPlain = candidate.plain;
    },
    setCustomPinyin(lineIndex, index, value) {
      const item = this.lines[lineIndex][index];
      item.currentPUJ = value;
      item.currentPlain = value;
    },
    exportLine(line) {
      let str = '';
      // 上一个已输出的 token 类型：'word' | 'punct' | 'quote-open' | 'quote-close' | 'star'
      // 'star' 表示刚输出了代表组外虚拟 Ｘ 的单独一个 *
      let prevOut = null;
      const emitStar = () => {
        if (prevOut) str += ' ';
        str += '*';
        prevOut = 'star';
      };
      line.forEach((item, index) => {
        if (item.isPunct) {
          if (!this.outputPunct) return;
          const mapped = toWesternPunct(item.char);
          if (!mapped) return;
          if (item.isQuote) {
            // 引号紧贴所引的内容：左引号前若有内容则空一格，右引号前不留空格。
            if ((!item.isQuoteClose && prevOut) || prevOut === 'star') str += ' ';
            str += mapped;
            prevOut = item.isQuoteClose ? 'quote-close' : 'quote-open';
            return;
          }
          if (prevOut === 'star') str += ' ';
          str += mapped;
          prevOut = 'punct';
          return;
        }
        // 本调在连调组之前（虚拟 Ｘ）：在该组第一个拼音之前单独写一个 *
        if (item.isHan && item.xBefore && this.isGroupStart(line, index)) {
          emitStar();
        }
        let text = item.isHan
            ? (this.outputAsPlain ? item.currentPlain : item.currentPUJ)
            : item.char;
        if (item.isHan && !text) text = '?';
        if (item.isHan && item.isX) text += '*';
        if (prevOut) {
          const prev = line[index - 1];
          if (prevOut === 'star') str += prev?.breakAfter ? ' / ' : ' ';
          else if (prevOut === 'quote-open') str += ''; // 紧贴左引号
          else if (prevOut === 'punct' || prevOut === 'quote-close') str += ' ';
          else if (!prev.isHan) str += ' ';
          // 同一个词内部的两个音节用 _ 相连；连调组边界写在之后
          else if (prev.wordJoin) str += prev.breakAfter ? '_/ ' : '_';
          else if (prev.breakAfter) str += ' / ';
          else str += ' ';
        }
        str += text;
        prevOut = 'word';
        // 本调在连调组之后（虚拟 Ｘ）：在该组最后一个拼音之后单独写一个 *
        if (item.isHan && item.xAfter && this.isGroupEnd(line, index)) {
          emitStar();
        }
      });
      return str;
    },
    convertAction() {
      try {
        this.convertToPinyin(this.convertInput);
      } catch (e) {
        alert(`发生错误：${e}`);
      }
    },
    resetAction() {
      this.convertInput = '';
      this.lines = [];
      this.copied = false;
    },
    copyAction() {
      const text = this.finalPUJ;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      });
    },
    convertToPinyin(text) {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return;
      }
      const oldLines = this.lines;
      const textLines = text.replace(/\r\n?/g, '\n').split('\n');
      // 逐行逐字比对，文字未变的部分沿用原有 item，以保留已做的标注。
      this.lines = textLines.map((lineText, lineIndex) => {
        const oldLine = oldLines[lineIndex] ?? [];
        return tokenizeLine(lineText).map((token, index) => {
          const old = oldLine[index];
          if (old && old.char === token) return old;
          return createItem(token);
        });
      });
      for (const line of this.lines) {
        this.resolveQuoteDirection(line);
        this.applyPunctAutoX(line);
      }
    },
    // 判定英文 " 是左引号还是右引号：行内左右引号交替出现。
    resolveQuoteDirection(line) {
      let open = false;
      for (const item of line) {
        if (!item.isQuote) continue;
        item.isQuoteClose = item.isQuoteAmbiguous
            ? open
            : QuoteCloseChars.indexOf(item.char) !== -1;
        open = !item.isQuoteClose;
      }
    },
    // 标点之前，以及没有标点收尾的行末，其最后一个汉字自动勾选为本调 Ｘ
    // （仅在该连调组尚未标注时进行）。
    applyPunctAutoX(line) {
      line.forEach((item, index) => {
        if (!item.isPunct || item.isQuote) return;
        this.markLastAsX(line, index);
      });
      const last = line[line.length - 1];
      if (last && last.isHan) this.markLastAsX(line, line.length);
    },
    // 从 end 位置向前找到最近的汉字，若其所属连调组尚未标注，则勾选为 Ｘ。
    // 引号是透明的，向前查找时跳过。
    markLastAsX(line, end) {
      for (let i = end - 1; i >= 0; --i) {
        if (line[i].isQuote) continue;
        if (!line[i].isHan) return;
        const group = this.groupOf(line, i);
        if (group.some(j => line[j].isX)) return;
        // 组两端已标虚拟 Ｘ（全轻声／全前变调）时，不自动指定本调
        if (line[group[0]].xBefore || line[group[group.length - 1]].xAfter) return;
        line[i].isX = true;
        return;
      }
    },
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
    $("#reset-button").click(function () {
      this.blur();
    });
    $("#query-button").click(function () {
      this.blur();
    });
    initFromDatabase().then(() => {
      setLoading(false);
    });
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';

.pu-lines {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.pu-line {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  column-gap: .125rem;
  row-gap: .5rem;
}

.pu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 3.5rem;
}

.pu-char {
  font-size: .875rem;
  color: var(--bs-secondary-color);
  white-space: nowrap;
}

.pu-pos {
  display: inline-block;
  min-width: 1rem;
  margin-right: .125rem;
  font-size: .75rem;
  font-weight: bold;
  text-align: center;
}

.pu-pos-X {
  color: var(--bs-danger);
}

.pu-pos-W {
  color: var(--bs-warning-text-emphasis, #997404);
}

.pu-pos-Y {
  color: var(--bs-primary);
}

.pu-pos-Z {
  color: var(--bs-secondary-color);
  font-style: italic;
}

.pu-pinyin {
  font-size: 1rem;
  line-height: 1.2;
}

.pu-py-toggle {
  cursor: pointer;
}

.pu-input {
  width: 4rem;
  text-align: center;
  padding: 0 .25rem;
}

.pu-cat {
  margin-left: .25rem;
  font-size: .75rem;
}

.pu-cat-1 {
  color: var(--bs-success);
}

.pu-cat-2 {
  color: var(--bs-primary);
}

.pu-cat-3 {
  color: var(--bs-secondary-color);
}

.pu-check {
  display: flex;
  align-items: center;
  gap: .25rem;
  margin: 0;
}

.pu-check-label {
  font-size: .75rem;
  color: var(--bs-secondary-color);
  cursor: pointer;
}

.pu-literal {
  align-self: flex-end;
  margin-bottom: 1.75rem;
  white-space: pre;
}

.pu-edge {
  align-self: flex-end;
}

.pu-gap {
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  row-gap: .125rem;
}

.pu-gap-btn {
  padding: 0 .3rem;
  line-height: 1.1;
  font-weight: bold;
}

.pu-literal-punct {
  color: var(--bs-tertiary-color, var(--bs-secondary-color));
}

.pu-help {
  margin-top: .5rem;
}
</style>
