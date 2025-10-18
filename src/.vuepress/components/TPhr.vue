<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container py-4">
    <form class="row g-3 mb-4" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="input-group">
          <input class="form-control form-control-lg" id="query-input" type="text" placeholder="输入字词..."
                 maxlength="256" v-model="queryInput"/>
          <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryPhrases">
            <!--<i class="bi bi-search"></i>-->
            查询
          </button>
          <button id="reset-button" class="btn btn-outline-danger" type="button" @click="resetQuery">
            <!--<i class="bi bi-x-circle"></i>-->
            重置
          </button>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center">
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <div id="query-result" class="mt-4">
      <div v-if="queryResultEmpty" class="alert alert-info">没有找到符合条件的结果。</div>
      <div v-else class="row g-3">
        <div class="col-12" v-for="result in queryResult">
          <div class="card shadow-sm">
            <div class="card-header bg-transparent">
              <div class="d-flex align-items-center">
                <div style="display: flex; flex-wrap: wrap; align-items: center;">
                  <h4 class="mb-1 me-2" style="margin-top: 0.3em">
                    <template v-for="(char, i) in result.teochew">
                      <template v-if="i"> · </template>{{ char }}
                    </template>
                    <template v-if="result.informal.length">
                      [*<template v-for="(char, i) in result.informal"><template v-if="i"> · </template>{{ char }}</template>]
                    </template>
                  </h4>
                  <span class="me-1" v-for="(p, i) in result.puj">
                    <TPopupPuj :puj="p" :key="p" :charsList="[...result.teochew, ...result.informal]"/>
                  </span>
                  <span class="text-muted me-1">
                    <template v-for="(cmn, i) in result.cmn">
                      <template v-if="i">; </template>{{ cmn }}
                    </template>
                  </span>
                </div>
                <div class="ms-auto">
                  <template v-for="(tag, i) in result.tagDisplay">
                    <span
                      class="badge ms-1"
                      :style="{
                        'background-color': getRandomColor(tag),
                      }"
                    >
                      {{ tag }}
                    </span>
                  </template>
                </div>
              </div>
              <div class="card-body" style="padding: 0.2em 0" v-if="result.hasDetails">
                <div class="card-text">
                  <div>
                    <span v-if="result.desc" v-html="result.desc"></span>
                    <template v-for="(example, iExample) in result.examples">
                      <div class="border-top my-2"></div>
                      <template v-for="(teochew, i) in example.teochew">
                        <span class="me-1"><template v-if="i">/</template>{{ teochew }}</span>
                      </template>
                      <template v-for="(p, i) in example.puj">
                        <span class="me-1"><template v-if="i">/</template><TPopupPuj :puj="p" :key="p"/></span>
                      </template>
                      <template v-for="(mandarin, i) in example.mandarin">
                        <span class="me-1 text-muted"><template v-if="i">/</template>{{ mandarin }}</span>
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {withBase} from "vuepress/client";
import TDarkTheme from "./TDarkTheme.vue";
import TPopupPuj from "./TPopupPuj.vue";
</script>

<script lang="ts">
import TPopupPuj from "./TPopupPuj.vue";
import {createVNode, render} from 'vue';
import {
  Entry, Pronunciation,
  getAccentsRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db,
  isChineseChar, PhraseSyllable,
} from './QCommon.vue';
import {darkThemeString} from "./QDarkTheme.vue";
import jquery from 'jquery';
import {pujpb} from "./SPujPb";
import {ChineseCharRegex, ChineseCharRegexGlobal} from "./SUtils";

const $ = jquery;

// A preprocessed phrase unit could be:
// 1. a Chinese character
// 2. a word with more than one valid written forms (e.g. 脚/骹, 姿娘/诸娘)
// 3. a pinyin word for one Chinese character (e.g. huai5)
class PreprocessedPhraseUnit {
  str: string;
  children: PreprocessedPhraseUnit[];
  tryMatchSelf(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number;
  tryMatch(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number {
    if (curI >= possibleChars[0].length) return 0;
    const matchSelf = this.tryMatchSelf(phrase, possibleChars, possibleProns, curI);
    if (matchSelf) {
      if (!this.children.length)
        return matchSelf;
      for (const child of this.children) {
        const matchChild = child.tryMatch(phrase, possibleChars, possibleProns, curI + matchSelf);
        if (matchChild)
          return matchSelf + matchChild;
      }
    }
    return 0;
  }
}

class PreprocessedPhraseUnitChar extends PreprocessedPhraseUnit {
  str: string;

  constructor(rawInput: string) {
    super();
    this.str = rawInput;
  }

  tryMatchSelf(): number {
    const possibleEntries: pujpb.IEntry[] = db.entriesCharMap[this.str];
    if (possibleEntries) {
      for (const entry of possibleEntries) {
        if (entry.char === this.str || entry.charSim === this.str)
          return 1;
      }
    }
    return 0;
  }
}

class PreprocessedPhraseUnitChars extends PreprocessedPhraseUnit {
  str: string;
  chars: string[];
  children: PreprocessedPhraseUnit[];
  otherWritten: pujpb.IPhrase[];

  constructor(str: string) {
    super();
    this.str = str;
    this.chars = [...str];
    this.otherWritten = [];
    if (db.phrasesTeochewMap[this.str])
      this.otherWritten.push(...db.phrasesTeochewMap[this.str]);
    if (db.phrasesInformalMap[this.str])
      this.otherWritten.push(...db.phrasesInformalMap[this.str]);
  }

  tryMatchSelf(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number {
    const lenSelf = this.chars.length;
    const lenMatch = possibleChars[0].length;
    if (curI + lenSelf > lenMatch) {
      return 0;
    }
    if (this.children.length === 0 && curI + lenSelf !== lenMatch) {
      return 0;
    }
    if (this.xTryMatchTeochew(this.chars, possibleChars, curI)) {
      return lenSelf;
    }
    for (let phraseTeochew of this.otherWritten) {
      if (this.xTryMatchSelf(phraseTeochew, possibleChars, curI))
        return lenSelf;
    }
    return 0;
  }

  private xTryMatchSelf(phrase: pujpb.IPhrase, possibleChars: string[][], curI: number): boolean {
    for (let teochew of phrase.teochew) {
      if (this.xTryMatchTeochew([...teochew], possibleChars, curI))
        return true;
    }
    for (let teochew of phrase.informal) {
      if (this.xTryMatchTeochew([...teochew], possibleChars, curI))
        return true;
    }
    return false;
  }

  private xTryMatchTeochew(teochew: string[], possibleChars: string[][], curI: number): boolean {
    for (const charsList of possibleChars) {
      let i = curI;
      let thisI = 0;
      let allMatched = true;
      for (; i < charsList.length && thisI < teochew.length; ++i, ++thisI) {
        if (charsList[i] !== teochew[thisI]) {
          allMatched = false;
          break;
        }
      }
      if (allMatched) return true;
    }
    return false;
  }
}

class PreprocessedPhraseUnitWildcardOne extends PreprocessedPhraseUnit {
  str: string;
  children: PreprocessedPhraseUnit[];

  constructor() {
    super();
    this.str = '?';
  }

  tryMatchSelf(/*phrase: pujpb.IPhrase, chars: string[], curI: number*/): number {
    return 1;
  }
}

class PreprocessedPhraseUnitWildcardAny extends PreprocessedPhraseUnit {
  str: string;
  children: PreprocessedPhraseUnit[];

  constructor() {
    super();
    this.str = '*';
  }

  tryMatchSelf(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number {
    console.error('PreprocessedPhraseUnitWildcardAny.tryMatchSelf should never be called');
  }

  tryMatch(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number {
    const maxLengthToMatch = possibleChars[0].length;
    if (this.children.length === 0) {
      // Match all left
      return maxLengthToMatch - curI;
    }
    for (let i = maxLengthToMatch - curI - 1; i >= 1; --i) {
      for (const child of this.children) {
        const matchChild = child.tryMatch(phrase, possibleChars, possibleProns, curI + i);
        if (matchChild) {
          return i + matchChild;
        }
      }
    }
    return 0;
  }
}

class PreprocessedPhraseUnitPinyin extends PreprocessedPhraseUnit {
  children: PreprocessedPhraseUnit[];
  str: string;

  constructor(pinyin: string) {
    super();
    this.str = pinyin;
  }
}

class PreprocessedPhraseUnitsTree {
  input: string[];
  children: PreprocessedPhraseUnit[];
  treeCache: Map<number, PreprocessedPhraseUnit[]>;
  str: string;

  constructor(queryInput: string) {
    this.str = queryInput;
    this.input = [...queryInput];
    this.treeCache = new Map();
    this.children = this.buildTree(0);
  }

  private buildTree(curI: number): PreprocessedPhraseUnit[] {
    if (curI >= this.input.length) return [];
    if (this.treeCache.has(curI)) return this.treeCache.get(curI);
    const cur = this.input[curI];
    const latinRegex = /[a-zA-Z]/;
    if (latinRegex.test(cur)) {
      let i = 0;
      let s = '';
      while (i < this.input.length && latinRegex.test(this.input[i])) s += this.input[i++];
      const curUnit = new PreprocessedPhraseUnitPinyin(s);
      curUnit.children = this.buildTree(i);
      this.treeCache.set(curI, [curUnit]);
      return this.treeCache.get(curI);
    }
    if (isChineseChar(cur)) {
      const nMaxMultiWrittenDetect = 3;
      const result = [];
      let s = '';
      for (let j = 0; j < nMaxMultiWrittenDetect; ++j) {
        if (curI + j >= this.input.length) break;
        let newChar = this.input[curI + j];
        if (!isChineseChar(newChar)) break;
        s += newChar;
        if (j > 0 && !db.phrasesTeochewMap.has(s) && !db.phrasesInformalMap.has(s)) break;
        const multiWritten = new PreprocessedPhraseUnitChars(s);
        multiWritten.children = this.buildTree(curI + j + 1);
        result.push(multiWritten);
      }
      this.treeCache.set(curI, result);
      return this.treeCache.get(curI);
    }
    if (cur === '?') {
      const wildcard = new PreprocessedPhraseUnitWildcardOne();
      wildcard.children = this.buildTree(curI + 1);
      this.treeCache.set(curI, [wildcard]);
      return this.treeCache.get(curI);
    }
    if (cur === '*') {
      const wildcard = new PreprocessedPhraseUnitWildcardAny();
      wildcard.children = [];
      for (let j = curI + 1; j < this.input.length; ++j) {
        if (this.input[j] !== '*') {
          wildcard.children = this.buildTree(j);
          break;
        }
      }
      this.treeCache.set(curI, [wildcard]);
      return this.treeCache.get(curI);
    }
    // current char is ignored
    this.treeCache.set(curI, this.buildTree(curI + 1));
    return this.treeCache.get(curI);
  }
}

class PreprocessedPhraseInput {
  // The original user input
  rawInput: string;
  // Pinyin method: puj or dp
  pinyin: string;
  input: string[];
  root: PreprocessedPhraseUnitsTree;
  allChineseChars: boolean;
  hasWildcard: boolean;

  constructor(rawInput: string, pinyin: string = 'puj') {
    this.rawInput = rawInput;
    this.input = [...rawInput];
    this.pinyin = pinyin.toLowerCase();
    this.root = new PreprocessedPhraseUnitsTree(rawInput);
    this.allChineseCharacters = true;
    this.hasWildcard = false;
    for (const char of this.input) {
      if (!isChineseChar(char)) {
        this.allChineseChars = false;
      }
      if (char === '*' || char === '?') {
        this.hasWildcard = true;
      }
    }
  }
  tryMatch(phrase: pujpb.IPhrase): boolean {
    // Fast path
    if (this.allChineseChars) {
      for (const teochew of phrase.teochew) {
        if (teochew === this.rawInput) {
          return true;
        }
      }
    }

    for (let child of this.root.children) {
      const phraseSyllableMap: PhraseSyllable = db.phrasesSyllableMap.get(phrase.index);
      if (phraseSyllableMap) {
        for (const [nSyllable, prons] of phraseSyllableMap.pronsMap.entries()) {
          const chars = phraseSyllableMap.charsMap.get(nSyllable);
          if (!chars) {
            console.error(`No chars of nSyllable ${nSyllable} ${phrase.index} ${phrase.puj.join('/')}`);
            continue;
          }
          if (child.tryMatch(phrase, chars, prons, 0))
            return true;
        }
      }
    }

    return false;
  }
}

export default {
  data() {
    return {
      queryInput: '',
      queryResult: [],
      queryResultEmpty: false,
      teochewIndexing: {},
      cmnIndexing: {},
      pujIndexing: {},
      activePopupPhraseIndex: -1,
      activePopupPronunciationIndex: -1,
      randomTagColor: {},
    };
  },
  watch: {
    // remove all non-Chinese characters
    // queryInput(newVal, oldVal) {
    //   if (newVal !== oldVal) {
    //     this.queryInput = newVal.split('').filter(isChineseChar).join('');
    //   }
    // }
  },
  methods: {
    getRandomColor(str: string): string {
      if (this.randomTagColor[str]) return this.randomTagColor[str];
      // Generate RGB color with good contrast
      const randomBytes = new Uint32Array(4);
      const randomBytes2 = new Int32Array(4);
      crypto.getRandomValues(randomBytes);
      crypto.getRandomValues(randomBytes2);
      const r = randomBytes[0] / 0xffffffff * 136 + randomBytes2[0] % 40;
      const g = randomBytes[1] / 0xffffffff * 136 + randomBytes2[1] % 40;
      const b = randomBytes[2] / 0xffffffff * 136 + randomBytes2[2] % 40;
      // const r = Math.floor(Math.random() * 156)/* + 100*/;
      // const g = Math.floor(Math.random() * 156)/* + 100*/;
      // const b = Math.floor(Math.random() * 156)/* + 100*/;
      return this.randomTagColor[str] = `rgba(${r}, ${g}, ${b}, 0.9)`;
    },
    formatDesc(desc: string) {
      if (!desc) return '';
      let result = desc;
      // get all things in @{...}
      const pujRegExp = /@\{([^}]+)\}/g;
      const matches = desc.matchAll(pujRegExp);
      for (const match of matches) {
        const fullMatch = match[0];
        const content = match[1];
        const replacement = `<span data-puj="${content}"></span>`;
        result = result.replace(fullMatch, replacement);
      }
      return result;
    },
    renderPopupPujElements() {
      const elements = document.querySelectorAll('[data-puj]');
      elements.forEach((element) => {
        const puj = element.getAttribute('data-puj');
        const vNode = createVNode(TPopupPuj, { puj });
        const span = document.createElement('span');
        render(vNode, span);
        element.replaceWith(span);
      });
    },
    tryMatch(input: string, phrase: pujpb.IPhrase): boolean {
      const preprocessedInput = new PreprocessedPhraseInput(input);
      return preprocessedInput.tryMatch(phrase);
    },
    queryPhrase(chars: string) {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return [];
      }
      // verify input and convert to array
      if (chars.length === 0) {
        return [];
      }
      let result = [];
      let resultPhrases = [];
      let resultPhrasesIndices = new Set();
      let pushResult = (phrase) => {
        if (resultPhrasesIndices.has(phrase.index)) return;
        resultPhrasesIndices.add(phrase.index);
        resultPhrases.push(phrase);
      };
      for (let i = 0; i < db.phrases.length; i++) {
        const phrase = db.phrases[i];
        if (this.tryMatch(chars, phrase)) {
          pushResult(phrase);
        }
      }
      for (const phrase of resultPhrases) {
        const desc = this.formatDesc(phrase.desc);
        result.push({
          index: phrase.index,
          teochew: phrase.teochew,
          puj: phrase.puj,
          cmn: phrase.cmn,
          desc: desc,
          examples: phrase.examples,
          informal: phrase.informal,
          tagDisplay: phrase.tagDisplay,
          hasDetails: (!!desc.length || !!phrase.examples.length)
        });
      }
      result.sort(obj => obj.index);
      return result;
    },
    queryPhrases() {
      this.queryResult = [];
      let charsInput = this.queryInput;
      let result = this.queryPhrase(charsInput);
      this.queryResult = result;
      this.queryResultEmpty = (result.length === 0);
    },
    resetQuery() {
      this.queryInput = '';
      this.queryResultEmpty = false;
      this.queryResult = [];
    },
    onInitFromDatabaseFinished() {
      setLoading(false);
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
    initFromDatabase().then(() => {
      this.onInitFromDatabaseFinished();
      this.renderPopupPujElements();
    });

    $("#reset-button").click(function () {
      this.blur();
    });

    $("#query-button").click(function () {
      this.blur();
    });
  },
  updated() {
    this.renderPopupPujElements();
  },
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
//@import 'bootstrap-icons/font/bootstrap-icons.min.css';
</style>

<style scoped lang="scss">
.card-result-entry {
  cursor: pointer;
  padding: 10px;
  border: 1px solid var(--bs-border-color);
  transition: all 0.3s;
  background-color: var(--bs-body-bg);
}
.card-result-entry:hover {
  background-color: var(--bs-tertiary-bg);
}
.pronunciation-popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background-color: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 4px;
  padding: 0 10px 10px 10px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.15);
  max-width: none;
  width: auto;
}
</style>
