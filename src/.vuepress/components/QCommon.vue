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

class PUJDictDatabase {
  entries: pujpb.IEntry[];
  entriesCharMap: Map<string, pujpb.IEntry[]>;
  accents: pujpb.IAccent[];
  fuzzyRulesAction: Map<pujpb.FuzzyRule, (pron: pujpb.IPronunciation) => void>;
  phrases : pujpb.IPhrase[];

  async load() {
    const entriesPromise = fetch(withBase('/data/pujdict-base/dist/entries.pb'))
        .then(response => response.arrayBuffer());
    const accentsDataPromise = fetch(withBase('/data/pujdict-base/dist/accents.pb'))
        .then(response => response.arrayBuffer());
    const phrasesPromise = fetch(withBase('/data/pujdict-base/dist/phrases.pb'))
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
    for (const phrase of this.phrases) {
      phrase.tagDisplay = [];
      for (let i = 0; i < phrase.tag.length; ++i) {
        const tag = phrase.tag[i];
        phrase.tagDisplay.push(phrasesData.phraseTagDisplay[pujpb.PhraseTag[tag]]);
      }
    }
  }
}

// 改用 protobuf
var db: PUJDictDatabase = null;
// key: char; value: list of possible entries

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