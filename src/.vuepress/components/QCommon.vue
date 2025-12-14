<script setup lang="ts">
import {h, ref} from 'vue';
</script>

<script lang="ts">

import {h, ref} from 'vue';
import {withBase} from "vuepress/client";

import jquery from "jquery";

const $ = jquery;

import {
  Entry,
  Pronunciation,
} from "./SCommon";

import {pujpb} from "./SPujPb";

import {
  setLocalOption,
  getLocalOption,
  getLocalOptionList,
  isChineseChar,
} from "./SUtils";

import {
  AtomicFuzzyRule, convertPlainPUJToPronunciationWord,
  FuzzyRulesGroup,
  FuzzyRulesGroup_Dummy, regexpWordOptional,
} from "./SPuj";

function makeEntryFromJson(json) {
  let entry = new Entry(
      json.entry_index,
      json.char,
      json.char_sim,
      json.initial,
      json.final,
      json.tone,
      json.cat
  );
  return entry;
}

function makeEntryFromSqlResult(sqlResult) {
  let entry = new Entry(
      ...sqlResult
  );
  return entry;
}

class PhraseSyllable {
  charsMap: Map<number, string[][]>;
  pronsMap: Map<number, string[][]>;

  constructor(phrase: pujpb.IPhrase) {
    const charsMap = new Map<number, string[][]>();
    const wordsMap = new Map<number, string[][]>();
    const funcPushTeochew = (teochewList: string[]) => {
      for (const teochew of teochewList) {
        const chars = [...teochew];
        const nChar = chars.length;
        if (!charsMap.get(nChar)) charsMap.set(nChar, []);
        charsMap.get(nChar).push(chars);
      }
    };
    funcPushTeochew(phrase.teochew);
    funcPushTeochew(phrase.informal);
    for (const puj: string of phrase.puj) {
      const words = puj.match(/[\w']+/g);
      const nWord = words.length;
      if (!wordsMap.get(nWord)) wordsMap.set(nWord, []);
      wordsMap.get(nWord).push(words);
    }
    this.charsMap = charsMap;
    this.pronsMap = wordsMap;
  }
}

class PUJDictDatabase {
  entries: pujpb.IEntry[];
  // 输入汉字，映射到这个汉字的 entry 列表（如果一简对多繁则表数量大于1）
  entriesCharMap: Map<string, Set<number/*char entry index*/>>;
  accents: pujpb.IAccent[];
  fuzzyRuleDescriptors: pujpb.IFuzzyRuleDescriptor[];
  fuzzyRulesAction: Array<(pron: pujpb.IPronunciation) => void>;
  private accentResults: Map<string/*accent*/,  Map<string/*pronunciation*/, string/*fuzzy result*/>>;
  private accentPossibleResults: Map<string/*pronunciation*/, Set<string>/*fuzzyResults*/>;
  phrases: pujpb.IPhrase[];
  // 输入单词，映射到该单词的 phrase 列表。
  phrasesTeochewMap: Map<string/*teochew*/, pujpb.IPhrase[]>;
  phrasesMandarinMap: Map<string/*mandarin*/, pujpb.IPhrase[]>;
  phrasesInformalMap: Map<string/*informal teochew*/, pujpb.IPhrase[]>;
  // 合音表，存储所有有可能读合音的词，key 为合音写法或完整写法。
  phrasesFusionMap: Map<string/*phrase*/, pujpb.IPhrase[]>;
  // 可能有多个读音且音节数量不同（汉字数量不同）的单词单独存音节表
  phrasesSyllableMap: Map<number/*phrase index*/, PhraseSyllable>;
  // 快速索引单词中包含某个汉字的所有词组，用于查询词汇预筛。
  private phrasesFastIndexByCharList: pujpb.IPhrase[][];
  private phrasesFastIndexByCharPrime = 499;

  async load() {
    const entriesPromise = fetch(withBase('/data/pujbase/dist/entries.pb'))
        .then(response => response.arrayBuffer());
    const accentsDataPromise = fetch(withBase('/data/pujbase/dist/accents.pb'))
        .then(response => response.arrayBuffer());
    const phrasesPromise = fetch(withBase('/data/pujbase/dist/phrases.pb'))
        .then(response => response.arrayBuffer());
    const accentsDataResponse = await accentsDataPromise;

    const accentsData = pujpb.Accents.decode(new Uint8Array(accentsDataResponse));
    this.accents = accentsData.accents;
    this.fuzzyRulesAction = [];
    this.accentResults = new Map();
    for (const accent of this.accents) {
      this.accentResults.set(accent.id, new Map());
    }
    this.accentPossibleResults = new Map();

    const fuzzyRuleDescriptors = accentsData.fuzzyRuleDescriptors;
    this.fuzzyRuleDescriptors = fuzzyRuleDescriptors;
    for (const fuzzyRuleDescriptor of fuzzyRuleDescriptors) {
      // const fuzzyRuleId: string = fuzzyRuleDescriptor.id;
      const fuzzyFunctions = [];
      for (const action of fuzzyRuleDescriptor.actions) {
        let fuzzyFunction = null;
        const re = new RegExp(action.pattern);
        switch (action.action) {
          case 'final':
            fuzzyFunction = (pron: pujpb.IPronunciation) => {
              // console.debug(`Running rule ${fuzzyRuleId} on ${pron.initial} ${pron.final}`);
              pron.final = pron.final.replace(re, action.replacementDollar);
            };
            break;
          case 'initial+final':
            fuzzyFunction = (pron: pujpb.IPronunciation) => {
              // console.debug(`Running rule ${pujpb.FuzzyRule[fuzzyRuleId]} on ${pron.initial} ${pron.final}`);
              const initialFinal = `${pron.initial}${pron.final}`;
              const newInitialFinal = initialFinal.replace(re, action.replacementDollar);
              const match = newInitialFinal.match(regexpWordOptional);
              if (!match) {
                console.error('Initial & final not matched: ' + newInitialFinal);
                return;
              }
              pron.initial = match.groups.initial ?? '';
              pron.final = match.groups.final ?? '';
            };
            break;
          default:
            fuzzyFunction = () => {
            };
            console.error('Unknown fuzzy rule action ' + action.action);
            break;
        }
        fuzzyFunctions.push(fuzzyFunction);
      }
      this.fuzzyRulesAction.push((pron: pujpb.IPronunciation) => {
        fuzzyFunctions.forEach(fuzzyFunction => { fuzzyFunction(pron); });
      });
    }

    const entriesResponse = await entriesPromise;
    const database: pujpb.IEntries = pujpb.Entries.decode(new Uint8Array(entriesResponse));
    this.entries = database.entries;
    this.entriesCharMap = new Map();
    const pushEntryMap = (c: string, entry: pujpb.IEntry) => {
      if (!this.entriesCharMap.has(c)) this.entriesCharMap.set(c, new Set());
      this.entriesCharMap.get(c).add(entry.index);
    };
    for (const entry of database.entries) {
      const char = entry.char;
      const charSim = entry.charSim;
      pushEntryMap(char, entry);
      pushEntryMap(charSim, entry);
    }

    const phrasesResponse = await phrasesPromise;
    const phrasesData = pujpb.Phrases.decode(new Uint8Array(phrasesResponse));
    this.phrases = phrasesData.phrases;
    this.phrasesTeochewMap = new Map();
    this.phrasesInformalMap = new Map();
    this.phrasesMandarinMap = new Map();
    this.phrasesFusionMap = new Map();
    this.phrasesSyllableMap = new Map();
    const pushPhraseMap = (map: Map<string, any>, key: string, val: pujpb.IPhrase) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(val);
    }
    for (const phrase of this.phrases) {
      this.phrasesSyllableMap.set(phrase.index, new PhraseSyllable(phrase));
      const nFirstWrittenCharCount = phrase.teochew[0].length;
      let hasFusion = false;
      for (const teochew of phrase.teochew) {
        pushPhraseMap(this.phrasesTeochewMap, teochew, phrase);
        if (teochew.length !== nFirstWrittenCharCount)
          hasFusion = true;
      }
      if (hasFusion) {
        for (const teochew of phrase.teochew) {
          pushEntryMap(this.phrasesFusionMap, teochew, phrase);
        }
      }
      for (const informal of phrase.informal) {
        pushPhraseMap(this.phrasesInformalMap, informal, phrase);
      }
      for (const mandarin of phrase.cmn) {
        pushPhraseMap(this.phrasesMandarinMap, mandarin, phrase);
      }
      // tagDisplay: enum 转成可读的文本（中文）
      phrase.tagDisplay = [];
      for (let i = 0; i < phrase.tag.length; ++i) {
        const tag = phrase.tag[i];
        phrase.tagDisplay.push(phrasesData.phraseTagDisplay[tag]);
      }
    }
    this.phrasesFastIndexByCharList = this.createPhrasesFastIndexByCharMap(this.phrases);
  }

  private createPhrasesFastIndexByCharMap(phrases: pujpb.IPhrase[]): pujpb.IPhrase[][] {
    const result = [];
    for (let i = 0; i < this.phrasesFastIndexByCharPrime; ++i) {
      result.push([]);
    }
    const funcAddIndex = (phrase: pujpb.IPhrase, teochewList: string[]) => {
      for (const item of teochewList) {
        const chars = [...item];
        for (const char: string of chars) {
          if (char === '＊') continue;
          const index = this.getPhrasesFastIndexByCharIndexNumber(char);
          result[index].push(phrase);
        }
      }
    };
    for (const phrase of phrases) {
      funcAddIndex(phrase, phrase.teochew);
      funcAddIndex(phrase, phrase.informal);
    }
    return result;
  }

  private getPhrasesFastIndexByCharIndexNumber(char: string): number {
    const charCode = char.charCodeAt(0);
    const res = charCode % this.phrasesFastIndexByCharPrime;
    return res;
  }

  /**
   * Get the phrases containing the given character.
   * @param char The SINGLE chinese character.
   * @return A set of phrase indices.
   */
  public getPhrasesFastIndexByChar(char: string): number/*phrase index*/[] {
    const index = this.getPhrasesFastIndexByCharIndexNumber(char);
    const res = [];
    const funcPushResult = (phrase: pujpb.IPhrase, teochewList: string[]) => {
      for (const teochew of teochewList) {
        if (teochew.indexOf(char) !== -1) {
          res.push(phrase.index);
          return true;
        }
      }
      return false;
    };
    for (const phrase of this.phrasesFastIndexByCharList[index]) {
      funcPushResult(phrase, phrase.teochew) || funcPushResult(phrase, phrase.informal);
    }
    return res;
  }

  public getCachedFuzzyResult(accentId: string, pron: Pronunciation): pujpb.IPronunciation {
    const accentMap = this.accentResults.get(accentId);
    if (!accentMap) {
      return null;
    }
    const accentRule = getAccentsRules()[accentId];
    if (!accentRule) {
      return null;
    }
    let pronStr = `${pron.initial}${pron.final}${pron.tone}`;
    let res = accentMap.get(pronStr);
    if (!res) {
      res = getAccentsRules()[accentId].fuzzy(pron);
      accentMap.set(pronStr, res);
    }
    return res;
  }
  // Note: this result does not have tone.
  public getCachedPossibleFuzzyResults(pron: Pronunciation): Set<string> {
    const pronStr = `${pron.initial}${pron.final}${pron.tone}`;
    if (!this.accentPossibleResults.has(pronStr)) {
      const res = new Set();
      for (const [, accentRule] of Object.entries(getAccentsRules())) {
        const fuzzyPron: Pronunciation = accentRule.fuzzy(pron);
        res.add(`${fuzzyPron.initial}${fuzzyPron.final}`);
      }
      this.accentPossibleResults.set(pronStr, res);
    }
    return this.accentPossibleResults.get(pronStr);
  }
}

var db: PUJDictDatabase = null;

async function initFromDatabase() {
  async function load() {
    if (db) return db;
    const res = new PUJDictDatabase();
    await res.load();
    return res;
  }

  db = await load();
}

// 口音规则
const getAccentsRules = function () {
  let fuzzyRules = null;
  return function () {
    if (fuzzyRules) return fuzzyRules;
    fuzzyRules = {};
    fuzzyRules['dummy'] = new FuzzyRulesGroup_Dummy();
    for (const accent of db.accents) {
      const id = accent.id;
      const area = accent.area;
      const subarea = accent.subarea;
      const rulesIndices = accent.rules;
      const accentTones = accent.tones;
      let rules = [];
      for (const ruleIndex of rulesIndices) {
        rules.push(db.fuzzyRulesAction[ruleIndex]);
      }
      fuzzyRules[id] = new FuzzyRulesGroup(`${area}${subarea}`, accentTones, rules);
    }
    // TODO: 这里自定义应该改成允许用户选择单条模糊音规则
    const custom = {
      name: '定制口音',
      fuzzy: function (original) {
        const customFuzzyQueryRule = new Set(getLocalOptionList('custom-accent-1-rules'));
        if (customFuzzyQueryRule !== this._fuzzy_str) {
          this._fuzzy_str = customFuzzyQueryRule;
          this._fuzzy_action_indices = [];
          try {
            for (let fuzzyRuleDescriptor of db.fuzzyRuleDescriptors)
              if (customFuzzyQueryRule.has(fuzzyRuleDescriptor.id))
                this._fuzzy_action_indices.push(fuzzyRuleDescriptor.index);
          } catch (e) {
            console.error(e);
          }
        }
        for (const index of this._fuzzy_action_indices)
          db.fuzzyRulesAction[index](original);
        return original;
      },
      _fuzzy_str: null,
      _fuzzy_action_indices: [],
    };
    fuzzyRules['custom-1'] = custom;
    return fuzzyRules;
  };
}();

function getFuzzyPronunciation(accentId, entry) {
  let accent = null;
  for (const a of db.accents) {
    if (a.id === accentId) {
      accent = a;
      break;
    }
  }
  let rule = getAccentsRules()[accentId];
  let fuzzyPron = '';
  if (accent) {
    const exception = accent.exceptions[entry.index];
    if (exception) {
      fuzzyPron = exception;
    } else {
      const pron = entry.pron;
      fuzzyPron = rule.fuzzy(pron);
    }
  } else {
    // dummy
    fuzzyPron = entry.pron;
  }
  return fuzzyPron;
}

function getCharEntryOfPronunciation(char: string, pron: Pronunciation) : pujpb.IEntry {
  const indices = db.entriesCharMap.get(char);
  if (!indices) return null;
  for (const index of indices) {
    const result = db.entries[index];
    if (result.pron.initial === pron.initial
        && result.pron.final === pron.final
        && result.pron.tone === pron.tone) {
      return result;
    }
  }
  return null;
}

// var initFromDatabasePromise = initFromDatabase();

function setLoading(loading) {
  if (loading) {
    $("#loading")?.css({display: "block"});
    $("#components-button")?.attr("disabled", "disabled");
    $("#reset-button")?.attr("disabled", "disabled");
    $("#query-button")?.attr("disabled", "disabled");
  } else {
    $("#loading")?.fadeOut(500);
    $("#components-button")?.removeAttr("disabled");
    $("#reset-button")?.removeAttr("disabled");
    $("#query-button")?.removeAttr("disabled");
  }
}

function setUrlQueryParameter(kv: {}) {
  let url = new URL(window.location.href);
  for (const [key, value] of Object.entries(kv)) {
    url.searchParams.set(key, value);
  }
  let newState = structuredClone(history.state);
  let urlStr = newState.current;
  if (urlStr) {
    // replace the query parameter or add the new parameter
    urlStr = url.pathname + url.search;
    newState.current = urlStr;
  }
  history.pushState(newState, "", url);
}

function resetUrlQueryParameter(ks: string[]) {
  let url = new URL(window.location.href);
  for (const key of ks)
    url.searchParams.delete(key);
  let newState = structuredClone(history.state);
  let urlStr = newState.current;
  if (urlStr) {
    // replace the query parameter or add the new parameter
    urlStr = url.pathname + url.search;
    newState.current = urlStr;
  }
  history.pushState(newState, "", url);
}

export {
  Entry, Pronunciation,
  PhraseSyllable,
  getAccentsRules,
  makeEntryFromJson, makeEntryFromSqlResult,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  getCharEntryOfPronunciation,
  db,
  isChineseChar,
}

const LoadingIcon = {
  render() {
    // img loading.svg
    return h('img', {
      id: 'loading',
      src: '/loading.svg',
      height: '30',
      width: '30',
    });
  },
};

export {
  LoadingIcon,
}

</script>

<template>

</template>

<style lang="scss">

@import 'bootstrap/scss/bootstrap-utilities';

</style>