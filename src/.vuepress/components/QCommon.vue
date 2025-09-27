<script setup lang="ts">
import {h, ref} from 'vue';
</script>

<script lang="ts">

import {h, ref} from 'vue';
import {withBase} from "vuepress/client";

import protobuf from "protobufjs";
import jquery from "jquery";

const $ = jquery;

import {
  Entry,
  Pronunciation,
} from "./SCommon.js";

import {pujpb} from "./SPujPb.js";

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
  FuzzyRulesGroup_Dummy,
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

// 改用 protobuf
var db = null;
var entries : pujpb.Entry[] = [];
var accents : pujpb.Accent[] = {};
var phrases : pujpb.Phrase[] = [];
var entriesCount = 0;
var initials = [];
var finals = [];
var combinations = [];
var exceptions = {};

async function initFromDatabase() {
  async function load() {
    const entriesPromise = fetch(withBase('/data/pujdict-base/dist/entries.pb'))
        .then(response => response.arrayBuffer());
    const accentsDataPromise = fetch(withBase('/data/pujdict-base/dist/accents.pb'))
        .then(response => response.arrayBuffer());
    const phrasesPromise = fetch(withBase('/data/pujdict-base/dist/phrases.pb'))
        .then(response => response.arrayBuffer());
    const accentsDataResponse = await accentsDataPromise;

    const accentsData = pujpb.Accents.decode(new Uint8Array(accentsDataResponse));
    accents = accentsData.accents;
    for (const accent of accents) {
      let rules = [];
      for (const rule of accent.rules) {
        let ruleString = pujpb.FuzzyRule[rule];
        ruleString = ruleString.replace('FR_', '');
        rules.push(ruleString);
      }
      accent.rulesStrings = rules;
    }

    const entriesResponse = await entriesPromise;
    db = pujpb.Entries.decode(new Uint8Array(entriesResponse));
    entries = db.entries;

    const phrasesResponse = await phrasesPromise;
    const phrasesData = pujpb.Phrases.decode(new Uint8Array(phrasesResponse));
    phrases = phrasesData.phrases;
    for (const phrase of phrases) {
      phrase.tagDisplay = [];
      for (let i = 0; i < phrase.tag.length; ++i) {
        const tag = phrase.tag[i];
        phrase.tagDisplay.push(phrasesData.phraseTagDisplay[pujpb.PhraseTag[tag]]);
      }
    }

    entriesCount = entries.length;
    initials = Array.from(new Set(entries.map(entry => entry.pron.initial))).sort();
    finals = Array.from(new Set(entries.map(entry => entry.pron.final))).sort();
    combinations = Array.from(new Set(entries.map(entry => entry.pron)));
    console.log();
  }

  await load();
}

// 口音规则
const getAccentsRules = function () {
  const fuzzyRules = {};
  return function () {
    if (fuzzyRules.length) return fuzzyRules;
    fuzzyRules['dummy'] = new FuzzyRulesGroup_Dummy();
    for (const accent of accents) {
      const id = accent.id;
      const area = accent.area;
      const rulesStrings = accent.rulesStrings;
      const accentTones = accent.tones;
      let rules = [];
      for (const rule of rulesStrings) {
        // rule string is the property of AtomicFuzzyRule
        rules.push(AtomicFuzzyRule[rule]);
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
  for (const a of accents) {
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
  db, entries, phrases, accents, entriesCount, initials, finals, combinations,
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