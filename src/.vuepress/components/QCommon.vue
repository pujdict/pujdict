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

// 改用 protobuf
var db = null;
var entries = [];
var entriesCount = 0;
var initials = [];
var finals = [];
var combinations = [];

async function initFromDatabase() {
  async function load() {
    const protoPromise = fetch(withBase('/data/pujdict-data-utils/entries.proto')).then(response => response.text());
    const dataPromise = fetch(withBase('/data/pujdict-data-utils/dist/entries.pb')).then(response => response.arrayBuffer());
    const protoResponse = await protoPromise;
    const dataResponse = await dataPromise;

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