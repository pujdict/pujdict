<script setup>
import {h, ref} from 'vue';
</script>

<script>

import {h, ref} from 'vue';
import {withBase} from "vuepress/client";

import protobuf from "protobufjs";
import jquery from "jquery";

const $ = jquery;

import {
  Entry,
  Pronunciation,
} from "./SCommon.js";

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
var entries = [];
var accents = [];
var entriesCount = 0;
var initials = [];
var finals = [];
var combinations = [];

async function initFromDatabase() {
  async function load() {
    const protoPromise = fetch(withBase('/data/pujdict-data-utils/entries.proto'))
        .then(response => response.text());
    const dataPromise = fetch(withBase('/data/pujdict-data-utils/dist/entries.pb'))
        .then(response => response.arrayBuffer());
    const accentsProtoPromise = fetch(withBase('/data/pujdict-data-utils/accents.proto'))
        .then(response => response.text());
    const accentsDataPromise = fetch(withBase('/data/pujdict-data-utils/dist/accents.pb'))
        .then(response => response.arrayBuffer());
    const protoResponse = await protoPromise;
    const dataResponse = await dataPromise;
    const accentsResponse = await accentsProtoPromise;
    const accentsDataResponse = await accentsDataPromise;
    const accentsRoot = protobuf.parse(accentsResponse).root;
    const typeAccents = accentsRoot.lookupType("puj.Accents");
    const typeFuzzyRule = accentsRoot.lookupEnum("puj.FuzzyRule");
    const accentsData = typeAccents.decode(new Uint8Array(accentsDataResponse));
    accents = accentsData.accents;
    accents.forEach(accent => {
      let rules = [];
      for (const rule of accent.rules) {
        let ruleString = typeFuzzyRule.values[rule];
        ruleString = ruleString.replace('FR_', '');
        rules.push(ruleString);
      }
      accent.rulesStrings = rules;
    });

    const root = protobuf.parse(protoResponse).root;
    const typeEntries = root.lookupType("puj.Entries");
    db = typeEntries.decode(new Uint8Array(dataResponse));
    entries = db.entries;

    entriesCount = entries.length;
    initials = Array.from(new Set(entries.map(entry => entry.pron.initial))).sort();
    finals = Array.from(new Set(entries.map(entry => entry.pron.final))).sort();
    combinations = Array.from(new Set(entries.map(entry => entry.pron)));
    console.log();
  }

  await load();
}

// 口音规则
const getFuzzyRules = function () {
  const fuzzyRules = {};
  return function () {
    if (fuzzyRules.length) return fuzzyRules;
    fuzzyRules['dummy'] = new FuzzyRulesGroup_Dummy();
    for (const accent of accents) {
      const id = accent.id;
      const area = accent.area;
      const rulesStrings = accent.rulesStrings;
      let rules = [];
      for (const rule of rulesStrings) {
        // rule string is the property of AtomicFuzzyRule
        rules.push(AtomicFuzzyRule[rule]);
      }
      fuzzyRules[id] = new FuzzyRulesGroup(area, rules);
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
  getFuzzyRules,
  makeEntryFromJson, makeEntryFromSqlResult,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  db, entries, entriesCount, initials, finals, combinations,
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