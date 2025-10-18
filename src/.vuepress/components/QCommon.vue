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
} from "./SCommon.js";

import {pujpb} from "./SPujPb";

import {
  setLocalOption,
  getLocalOption,
  setUrlQueryParameter,
  resetUrlQueryParameter,
  isChineseChar,
} from "./SUtils.js";

import {
  AtomicFuzzyRule,
  FuzzyRulesGroup,
  FuzzyRulesGroup_Dummy, regexpWordOptional,
} from "./SPuj.js";

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
  charsMap: Map<number, string[]>;
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
      const words = puj.match(/\w+/g);
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
  entriesCharMap: Map<string, pujpb.IEntry[]>;
  accents: pujpb.IAccent[];
  fuzzyRulesAction: Map<pujpb.FuzzyRule, (pron: pujpb.IPronunciation) => void>;
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
    this.fuzzyRulesAction = new Map();

    const fuzzyRuleDescriptors = accentsData.fuzzyRuleDescriptors;
    for (const fuzzyRuleDescriptor of fuzzyRuleDescriptors) {
      const fuzzyRuleId: pujpb.FuzzyRule = fuzzyRuleDescriptor.id;
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
      this.fuzzyRulesAction.set(fuzzyRuleId, (pron: pujpb.IPronunciation) => {
        fuzzyFunctions.forEach(fuzzyFunction => { fuzzyFunction(pron); });
      });
    }

    const entriesResponse = await entriesPromise;
    const database: pujpb.IEntries = pujpb.Entries.decode(new Uint8Array(entriesResponse));
    this.entries = database.entries;
    this.entriesCharMap = new Map();
    const pushEntryMap = (c: string, entry: pujpb.Entry) => {
      if (!this.entriesCharMap[c]) this.entriesCharMap[c] = [];
      this.entriesCharMap[c].push(entry);
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
    const pushPhraseMap = (map: Map, key: string, val: pujpb.IPhrase) => {
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
        phrase.tagDisplay.push(phrasesData.phraseTagDisplay[pujpb.PhraseTag[tag]]);
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
  const fuzzyRules = {};
  return function () {
    if (fuzzyRules.length) return fuzzyRules;
    fuzzyRules['dummy'] = new FuzzyRulesGroup_Dummy();
    for (const accent of db.accents) {
      const id = accent.id;
      const area = accent.area;
      const rulesIds = accent.rules;
      const accentTones = accent.tones;
      let rules = [];
      for (const ruleId of rulesIds) {
        rules.push(db.fuzzyRulesAction.get(ruleId));
      }
      fuzzyRules[id] = new FuzzyRulesGroup(area, accentTones, rules);
    }
    // TODO: 这里自定义应该改成允许用户选择单条模糊音规则
    const custom = {
      name: '自定',
      fuzzy: function (original) {
        const customFuzzyQueryRule = getLocalOption('custom-puj-fuzzy-rule');
        if (customFuzzyQueryRule !== this._fuzzy_str) {
          this._fuzzy_str = customFuzzyQueryRule;
          try {
            this._fuzzy_function = eval(customFuzzyQueryRule);
          } catch (e) {
            console.error(e);
            this._fuzzy_function = null;
          }
        }
        if (typeof this._fuzzy_function === 'function') {
          try {
            return this._fuzzy_function(new Pronunciation(original.initial, original.final, original.tone));
          } catch (e) {
            console.error(e);
          }
        }
        return original;
      },
      _fuzzy_function: null,
      _fuzzy_str: null,
    };
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

function getCharEntryOfPronunciation(char: string, pron: Pronunciation) : pujpb.Entry {
  const results = db.entriesCharMap[char];
  if (!results) return null;
  for (const result of results) {
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