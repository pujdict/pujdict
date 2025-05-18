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

import {
  Entry,
  Pronunciation
} from "./SCommon.js";

import {
  setLocalOption,
  getLocalOption,
  setUrlQueryParameter,
  resetUrlQueryParameter,
  isChineseChar,
} from "./SUtils.js";

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
        new Pronunciation(...combination.split("-")));
  }

  await load();
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