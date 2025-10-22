<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container">
    <form class="row g-3 mb-0" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="mb-3">
          <div class="form-label fw-bold d-flex align-items-center mb-2">输入拼音方案
            <TQuestionMarkTip title="因两种拼音方案不兼容，如需输入拼音，请先指定其中一种。" />
          </div>
          <div class="d-flex align-items-center flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" id="pinyin-type-puj" value="puj" v-model="selectedPinyin">
              <label class="form-check-label" for="pinyin-type-puj">白话字</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="pinyin-type-dp" value="dp" v-model="selectedPinyin">
              <label class="form-check-label" for="pinyin-type-dp">潮拼</label>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <div class="form-label fw-bold d-flex align-items-center mb-2">拼音匹配模式
            <TQuestionMarkTip title="自由匹配：将输入的拼音和所有口音可能的读音进行匹配；<br>口音匹配：只匹配给定的口音。" />
          </div>
          <div class="d-flex align-items-center flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" id="auto-match" value="auto" v-model="matchType">
              <label class="form-check-label" for="auto-match">自由匹配</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="exact-match" value="exact" v-model="matchType">
              <label class="form-check-label" for="exact-match">口音匹配</label>
            </div>
            <select class="form-select form-select-sm" style="width: auto;" v-model="selectedFuzzyQueryKey" :disabled="matchType !== 'exact'">
              <!--<option value="" disabled selected>请选择精确匹配选项</option>-->
              <template v-for="fuzzyQuery in fuzzyQueryList">
                <option :id="fuzzyQuery.key" :value="fuzzyQuery.key">
                  {{ fuzzyQuery.name }}
                </option>
              </template>
            </select>
          </div>
        </div>
        <div class="mb-0">
          <div class="form-label fw-bold d-flex align-items-center mb-2">输入字词
            <TQuestionMarkTip title="支持输入拼音，拼音若无声调则匹配所有声调；<br>支持通配符：半角问号 ? 匹配单个字，半角星号 * 匹配单个或多个字。" />
          </div>
          <div class="input-group">
            <input class="form-control" id="query-input" type="text" maxlength="256" v-model="queryInput"/>
            <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryPhrases">
              查询
            </button>
            <button id="reset-button" class="btn btn-outline-danger" type="button" @click="resetQuery">
              重置
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center">
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <div v-if="queryResultEmpty !== undefined" id="query-result" class="mt-3">
      <hr/>
      <div v-if="queryResultEmpty" class="alert alert-info">没有找到符合条件的结果。</div>
      <div v-else class="row g-3">
        <div class="col-12" v-for="result in queryResult">
          <div class="card shadow-sm">
            <div class="card-header bg-transparent">
              <div class="d-flex align-items-center">
                <div style="display: flex; flex-wrap: wrap; align-items: center;">
                  <h4 class="mb-1 me-2" style="margin-top: 0.3em">
                    <template v-for="(char, i) in result.teochew">
                      <template v-if="i <= 4 || result.__isExpanded">
                        <span v-if="i" class="text-muted">; </span>{{ char }}
                      </template>
                    </template>
                    <template v-if="result.teochew.length > 4">
                      <span v-if="!result.__isExpanded" @click="result.__isExpanded = true" style="cursor: pointer; color: #007bff;">…</span>
                    </template>
                    <template v-if="result.informal.length">
                      [*<template v-for="(char, i) in result.informal"><span v-if="i" class="text-muted">; </span>{{ char }}</template>]
                    </template>
                  </h4>
                  <span class="me-1" v-for="(p, i) in result.puj">
                    <span v-if="i" class="text-muted">; </span><TPopupPuj :puj="p" :key="p" :charsList="[...result.teochew, ...result.informal]"/>
                  </span>
                  <span class="text-muted me-1">
                    <template v-for="(cmn, i) in result.cmn">
                      <span v-if="i" class="text-muted">; </span>{{ cmn }}
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
import TQuestionMarkTip from "./TQuestionMarkTip.vue";
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
import {
  convertPlainPUJToPronunciationWord,
  regexpWordOptional,
  regexpWordDp,
  undoAddPUJToneMarkWord, convertDPWordToPronunciation, convertDPPronunciationToPUJPronunciation,
} from "./SPuj";

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
      if (!this.children.length && curI + matchSelf === possibleProns[0].length)
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
  inputPron: Pronunciation;
  inputPinyinWithoutTone: string;
  pinyinMatch: RegExpMatchArray;
  pinyinMatchCached: Map<string, RegExpMatchArray>;
  exact: boolean;
  accent: string;

  constructor(pinyin: string, pinyinMatch: RegExpMatchArray, exact: boolean, accent: string) {
    super();
    this.str = pinyin;
    this.inputPron = new Pronunciation(pinyinMatch.groups.initial || '', pinyinMatch.groups.final || '', pinyinMatch.groups.tone || '');
    this.inputPinyinWithoutTone = this.inputPron.initial + this.inputPron.final;
    this.pinyinMatch = pinyinMatch;
    this.pinyinMatchCached = new Map();
    this.exact = exact;
    this.accent = accent;
  }

  tryMatchSelf(phrase: pujpb.IPhrase, possibleChars: string[][], possibleProns: string[][], curI: number): number {
    if (curI >= possibleProns[0].length) {
      return 0;
    }
    for (let i = 0; i < possibleProns.length; ++i) {
      const possiblePron = possibleProns[i];
      if (this.matchPinyin(possiblePron[curI])) {
        return 1;
      }
    }
    return 0;
  }

  private getCachedMatch(pinyin: string): RegExpMatchArray {
    if (!this.pinyinMatchCached.has(pinyin)) {
      this.pinyinMatchCached.set(pinyin, pinyin.match(regexpWordOptional));
    }
    return this.pinyinMatchCached.get(pinyin);
  }

  private matchPinyin(pinyinToMatch: string): boolean {
    const matched = this.getCachedMatch(pinyinToMatch);
    const toMatchPron = new Pronunciation(matched.groups.initial || '', matched.groups.final || '', matched.groups.tone || '');
    if (this.exact) {
      const fuzzyPron = db.getCachedFuzzyResult(this.accent, toMatchPron);
      return this.inputPron.initial === fuzzyPron.initial
          && this.inputPron.final === fuzzyPron.final
          && (this.inputPron.tone === fuzzyPron.tone || !this.inputPron.tone)
    }
    if (!db.getCachedPossibleFuzzyResults(toMatchPron).has(this.inputPinyinWithoutTone)) {
      return false;
    }
    if (!this.inputPron.tone || this.inputPron.tone == 0 || this.inputPron.tone == '') {
      return true;
    }
    return this.inputPron.tone === toMatchPron.tone;
  }
  private matchInitials(pinyin: string, userInput: string): boolean {
    if (pinyin === '0' || !pinyin) pinyin = '';
    if (userInput === '0' || !userInput) userInput = '';
    return pinyin === userInput;
  }
  private matchTones(pinyin: string, userInput: string): boolean {
    // if no tones, match all
    if (!userInput) return true;
    return pinyin === userInput;
  }

  private freeMatch(pinyinPron: Pronunciation, userInputPron: Pronunciation): boolean {
    let pinyinInitial = pinyinPron.initial;
    let userInputInitial = userInputPron.initial;
    let pinyinFinal = pinyinPron.final;
    let userInputFinal = userInputPron.final;

    if (pinyinInitial === '0' || !pinyinInitial) pinyinInitial = '';
    if (userInputInitial === '0' || !userInputInitial) userInputInitial = '';
    if (pinyinInitial !== userInputInitial) {
      // buan <-> muan?
      return false;
    }

    if (pinyinFinal === userInputFinal) return true;
    if (pinyinFinal === 'or') return ['o', 'e', 'or'].includes(userInputFinal);
    if (pinyinFinal === 'orh') return ['oh', 'ee', 'orh'].includes(userInputFinal);
    if (pinyinFinal === 'eu') return ['iu', 'eu'].includes(userInputFinal);
    if (pinyinFinal === 'oinn') return ['oinn', 'ainn'].includes(userInputFinal);
    if (pinyinFinal === 'uoinn') return ['uoinn', 'uinn', 'uainn'].includes(userInputFinal);
    // 陆丰口音
    if (pinyinFinal.startsWith('ou')) return userInputFinal.startsWith('au') || userInputFinal.startsWith('ou');

    // 除非以上两种比较特殊的，其他的鼻化一律去掉，更模糊地匹配
    pinyinFinal = pinyinFinal.replace('nn', '');
    userInputFinal = userInputFinal.replace('nn', '');

    const matchPinyin = regexpWordOptional.match(pinyinFinal);
    const matchUserInput = regexpWordOptional.match(userInputFinal);
    // ian iam uan uam iau 的各类变体
    if (['i', 'u'].includes(matchPinyin.medial)
        && matchUserInput.nucleus === 'a') {
      if (['m', 'n'].includes(matchUserInput.coda)) {
        // 允许模糊匹配高化、前化、圆唇化、韵尾任意的所有变体。
        return (matchUserInput.medial === matchPinyin.medial || matchPinyin === 'i' && !matchUserInput.medial)
            && ['a', 'o', 'e', 'ur'].includes(matchUserInput.nucleus)
            && ['ng', 'm', 'n'].includes(matchUserInput.coda);
      }
      if (['u', 'uh'].includes(matchUserInput.coda)) {
        return (matchUserInput.medial === matchPinyin.medial || matchPinyin === 'i' && !matchUserInput.medial)
            && ['a', 'o', 'e', 'ur'].includes(matchUserInput.nucleus)
            && matchUserInput.coda === matchPinyin.coda;
      }
    }
    if (matchPinyin.medial === 'i'
        && matchPinyin.nucleus === 'o'
        && (!matchPinyin.coda || ['nn', 'nnh'].includes(matchPinyin.coda))) {
      return matchUserInput.medial === matchPinyin.medial
          && ['o', 'e', 'ur'].includes(matchUserInput.nucleus)
          && matchUserInput.coda === matchPinyin.coda;
    }

    // 按澄海口音，韵尾全部收 ng/k
    pinyinFinal = pinyinFinal.replace('n', 'ng');
    pinyinFinal = pinyinFinal.replace('t', 'k');
    pinyinFinal = pinyinFinal.replace('m', 'ng');
    pinyinFinal = pinyinFinal.replace('p', 'k');
    userInputFinal = userInputFinal.replace('n', 'ng');
    userInputFinal = userInputFinal.replace('t', 'k');
    userInputFinal = userInputFinal.replace('m', 'ng');
    userInputFinal = userInputFinal.replace('p', 'k');

    // buan <-> muan

    return pinyinFinal === userInputFinal;
  }
}

class PreprocessedPhraseUnitsTree {
  input: string[];
  children: PreprocessedPhraseUnit[];
  treeCache: Map<number, PreprocessedPhraseUnit[]>;
  str: string;
  pinyinType: string;
  treeError: boolean;
  exact: boolean;
  accent: string;
  accentRule: any;

  constructor(queryInput: string, pinyinType: string, exact: boolean, accent: string) {
    this.str = queryInput;
    this.input = [...queryInput];
    this.pinyinType = pinyinType;
    if (pinyinType !== 'puj' && pinyinType !== 'dp') {
      console.error(`Unknown pinyin type ${pinyinType}`);
    }
    this.exact = exact;
    this.accent = accent;
    this.accentRule = getAccentsRules()[accent];
    this.treeCache = new Map();
    this.children = this.buildTree(0);
  }

  private buildTree(curI: number): PreprocessedPhraseUnit[] {
    if (curI >= this.input.length) return [];
    if (this.treeCache.has(curI)) return this.treeCache.get(curI);
    const cur = this.input[curI];
    const latinRegex = /[a-zA-Z0-9]/;
    if (latinRegex.test(cur)) {
      let i = curI;
      let s = '';
      while (i < this.input.length && latinRegex.test(this.input[i])) s += this.input[i++];
      if (this.pinyinType === 'dp') {
        const pujPron = convertDPPronunciationToPUJPronunciation(convertDPWordToPronunciation(s));
        if (!pujPron) {
          console.error(`Cannot convert dp pinyin ${s} to puj pinyin`);
          this.treeError = true;
        } else {
          s = `${pujPron.initial || ''}${pujPron.final || ''}${pujPron.tone || ''}`;
          console.log(s);
        }
      }
      const pinyinMatch = s.match(regexpWordOptional);
      if (pinyinMatch) {
        const curUnit = new PreprocessedPhraseUnitPinyin(s, pinyinMatch, this.exact, this.accent);
        curUnit.children = this.buildTree(i);
        this.treeCache.set(curI, [curUnit]);
      } else {
        console.error(`Cannot verify puj pinyin ${s}`);
        this.treeError = true;
        this.treeCache.set(curI, []);
      }
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
  pinyinType: string;
  input: string[];
  root: PreprocessedPhraseUnitsTree;
  allChineseChars: boolean;
  hasWildcard: boolean;

  constructor(rawInput: string, pinyinType: string = 'puj', exact: boolean = true, accentId: string) {
    this.rawInput = rawInput;
    this.input = [...rawInput];
    this.pinyinType = pinyinType.toLowerCase();
    this.root = new PreprocessedPhraseUnitsTree(rawInput, pinyinType, exact, accentId);
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
    if (this.root.treeError) {
      return false;
    }

    // Fast path
    if (this.allChineseChars) {
      for (const teochew of phrase.teochew) {
        if (teochew === this.rawInput) {
          return true;
        }
      }
    }
    if (this.rawInput.trim().match(/\*+/)) {
      return true;
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
      matchType: 'auto',
      selectedFuzzyQueryKey: getLocalOption("fuzzy-query") ?? 'dummy',
      selectedPinyin: getLocalOption("q-pron-default-pinyin") ?? 'puj',
      fuzzyQueryList: [{
        key: 'dummy',
        name: '辞典',
        fuzzy: () => {},
      }],
      queryInput: '',
      queryResult: [],
      queryResultEmpty: undefined,
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
      const preprocessedInput = new PreprocessedPhraseInput(input, this.selectedPinyin, this.matchType === 'exact', this.selectedFuzzyQueryKey);
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
      console.log(`Results: ${result.map(item => item.index).join(',')}`);
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
      this.fuzzyQueryList = Object.entries(getAccentsRules()).map(([key, rule]) => ({
        key,
        name: rule.name,
        fuzzy: rule.fuzzy,
      }));
    }
  },
  mounted() {
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
