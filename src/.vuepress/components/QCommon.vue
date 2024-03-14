<script setup>
import {h, ref} from 'vue';
</script>

<script>

import {h, ref} from 'vue';
import {withBase} from "vuepress/client";

// import sql js
import initSqlJs from "sql.js";
import sqlWasm from "sql.js/dist/sql-wasm.wasm?url";
import jquery from "jquery";
const $ = jquery;

class Entry {
  constructor(entry_index, char, char_sim, initial, final, tone, cat, char_ref, details) {
    this.entry_index = entry_index;
    this.char = char;
    this.char_sim = char_sim;
    this.initial = initial;
    this.final = final;
    this.combination = initial + final + tone;
    this.tone = tone;
    this.cat = cat;
    this.char_ref = char_ref;
    this.details = details;
  }

  getCombination() {
    return this.combination;
  }
}

class PUJPronunciation {
  constructor(initial, final, tone) {
    this.initial = initial;
    this.final = final;
    this.tone = tone;
    this.combination = initial + final + tone;
  }

  getCombination() {
    return this.initial + this.final + this.tone;
  }
}

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
      sqlResult[0],
      sqlResult[1],
      sqlResult[2],
      sqlResult[3],
      sqlResult[4],
      sqlResult[5],
      sqlResult[6]
  );
  return entry;
}

// 改用 sql.js 读取数据库
var db = null;
var entriesCount = 0;
var initials = [];
var finals = [];
var combinations = [];

async function initFromDatabase() {
  async function load() {
    // Load sql.js WebAssembly file
    let config = {
      locateFile: () => sqlWasm,
      // locateFile: () => "https://lib.baomitu.com/sql.js/1.9.0/sql-wasm.wasm",
      // locateFile: () => '/data/sql-wasm.wasm',
    };
    const sqlPromise = initSqlJs(config);
    const dataPromise = fetch(withBase('/data/entries.db')).then(response => response.arrayBuffer());
    const [sql, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new sql.Database(new Uint8Array(buf));
    // read basic desc data from dbdesc table
    entriesCount = db.exec("SELECT description FROM dbdesc WHERE id='entries_count'")[0].values[0][0];
    initials = db.exec("SELECT description FROM dbdesc WHERE id='initials'")[0].values[0][0].split(",");
    finals = db.exec("SELECT description FROM dbdesc WHERE id='finals'")[0].values[0][0].split(",");
    // combinations are initial-final-tone connected by '-' and separated by ','
    combinations = db.exec("SELECT description FROM dbdesc WHERE id='combinations'")[0].values[0][0].split(",").map(combination =>
        new PUJPronunciation(...combination.split("-")));
  }

  await load();
}

// var initFromDatabasePromise = initFromDatabase();

function setLoading(loading) {
  if (loading) {
    $("#loading")?.css({display: "block"});
    $("#components-button")?.attr("disabled", "disabled");
    $("#reset-button")?.attr("disabled", "disabled");
  } else {
    $("#loading")?.fadeOut(500);
    $("#components-button")?.removeAttr("disabled");
    $("#reset-button")?.removeAttr("disabled");
  }
}

function setLocalOption(optionName, optionValue) {
  if (typeof document === 'undefined') return;
  try {
    localStorage.setItem(`pujdict-${optionName}`, optionValue);
    // VueCookies.set(optionName, optionValue, '365d', '/', '', true);
    // $.cookie(optionName, optionValue, {expires: 365, path: "/;SameSite=Lax", secure: true});
  } catch (e) {
    console.error(e);
  }
}

function getLocalOption(optionName, $default = null) {
  if (typeof document === 'undefined') return $default;
  try {
    return localStorage.getItem(`pujdict-${optionName}`) ?? $default;
    // return VueCookies.get(optionName) ?? $default;
    // return $.cookie(optionName);
  } catch (e) {
    console.error(e);
    return $default;
  }
}

function setUrlQueryParameter(key, value) {
  let url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

function resetUrlQueryParameter(key) {
  let url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url);
}

function isChineseChar(c) {
  /*
  CJK Unified Ideographs                  4E00-9FFF   Common
  CJK Unified Ideographs Extension A      3400-4DBF   Rare
  CJK Unified Ideographs Extension B      20000-2A6DF Rare, historic
  CJK Unified Ideographs Extension C      2A700–2B73F Rare, historic
  CJK Unified Ideographs Extension D      2B740–2B81F Uncommon, some in current use
  CJK Unified Ideographs Extension E      2B820–2CEAF Rare, historic
  CJK Unified Ideographs Extension F      2CEB0–2EBEF  Rare, historic
  CJK Unified Ideographs Extension G      30000–3134F  Rare, historic
  CJK Unified Ideographs Extension H      31350–323AF Rare, historic
  CJK Compatibility Ideographs            F900-FAFF   Duplicates, unifiable variants, corporate characters
  CJK Compatibility Ideographs Supplement 2F800-2FA1F Unifiable variants
  CJK Radicals / Kangxi Radicals          2F00–2FDF
  CJK Radicals Supplement                 2E80–2EFF
  CJK Symbols and Punctuation             3000–303F
   */
  let charCode = c.charCodeAt(0);
  return (charCode >= 0x4E00 && charCode <= 0x9FFF) ||
      (charCode >= 0x3400 && charCode <= 0x4DBF) ||
      (charCode >= 0x20000 && charCode <= 0x2A6DF) ||
      (charCode >= 0x2A700 && charCode <= 0x2B73F) ||
      (charCode >= 0x2B740 && charCode <= 0x2B81F) ||
      (charCode >= 0x2B820 && charCode <= 0x2CEAF) ||
      (charCode >= 0x2CEB0 && charCode <= 0x2EBEF) ||
      (charCode >= 0x30000 && charCode <= 0x3134F) ||
      (charCode >= 0x31350 && charCode <= 0x323AF) ||
      (charCode >= 0xF900 && charCode <= 0xFAFF) ||
      (charCode >= 0x2F800 && charCode <= 0x2FA1F) ||
      (charCode >= 0x2F00 && charCode <= 0x2FDF) ||
      (charCode >= 0x2E80 && charCode <= 0x2EFF);
}

export {
  Entry, PUJPronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  db, entriesCount, initials, finals, combinations,
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