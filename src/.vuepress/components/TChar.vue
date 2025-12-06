<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container py-1">
    <form class="row g-3" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="input-group">
          <input class="form-control" id="query-input" type="text" placeholder="输入汉字..."
                 maxlength="256" v-model="queryInput"/>
          <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryEntries">
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
    <div v-if="queryResultEmpty !== undefined" id="query-result" class="mt-3">
      <hr/>
      <div v-if="queryResultEmpty" class="alert alert-info">没有找到符合条件的结果。</div>
      <div v-else class="row g-3">
        <div class="col-12" v-for="result in queryResult">
          <div class="card shadow-sm">
            <div class="card-header bg-transparent">
              <div class="d-flex align-items-center">
                <h4 class="mb-1 me-2" style="font-weight: normal">{{ result.entry.charSim }}</h4>
                <span class="text-muted me-2"
                      v-if="result.entry.charSim !== result.entry.char">({{ result.entry.char }})</span>
                <span class="text-muted me-2" v-if="result.entry.charRef">[{{ result.entry.charRef }}]</span>
                <TPopupPuj :puj="result.puj" :charsList="[[result.entry.char]]" :key="result.puj"/>
                <span class="badge bg-primary me-2" v-if="result.entry.cat === 1">白</span>
                <span class="badge bg-primary me-2" v-if="result.entry.cat === 2">文</span>
                <span class="badge bg-primary me-2" v-if="result.entry.cat === 3">俗</span>
                <div class="ms-auto">
                  <span class="badge bg-primary text-light" v-if="result.entry.freq === 0">★★★</span>
                  <span class="badge bg-primary text-light" v-if="result.entry.freq === 1">★★☆</span>
                  <span class="badge bg-primary text-light" v-if="result.entry.freq === 2">★☆☆</span>
                  <span class="badge bg-primary text-light" v-if="result.entry.freq === 3">☆☆☆</span>
                </div>
              </div>
              <div class="card-body" style="padding: 10px 0" v-if="result.details.length">
                <div class="card-text">
                  <template v-for="(details, i) in result.details">
                    <div v-if="i > 0" class="border-top my-2"></div>
                    <div>
                      <strong v-if="details.meaning">{{ details.meaning }}</strong>
                      <span v-if="details.meaning.length && details.examples.length">：</span>
                      <template v-for="(example, j) in details.examples">
                        <span v-if="j > 0">；</span>
                        <span v-if="example.teochew">{{ example.teochew }}</span>
                        <span v-if="example.puj">
                          <TPopupPuj :puj="example.puj" :key="example.puj" :charsList="[[...example.teochew]]"/>
                        </span>
                        <span v-if="example.mandarin">
                          <span> ({{ example.mandarin }})</span>
                        </span>
                      </template>
                    </div>
                  </template>
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
import {
  Entry, Pronunciation,
  getAccentsRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db,
  isChineseChar,
} from './QCommon.vue';
import {darkThemeString} from "./QDarkTheme.vue";
import jquery from 'jquery';

const $ = jquery;

export default {
  data() {
    return {
      queryInput: '',
      queryResult: {},
      queryResultEmpty: undefined,
      activePopup: null,
    };
  },
  watch: {
    // remove all non-Chinese characters
    queryInput(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.queryInput = newVal.split('').filter(isChineseChar).join('');
      }
    }
  },
  methods: {
    togglePopup(index) {
      this.activePopup = this.activePopup === index ? null : index;
    },
    makeCombinationString(pron) {
      return `${pron.initial}${pron.final}${pron.tone}`;
    },
    queryChars(chars: string[]) {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return [];
      }
      // verify input and convert to array
      if (chars.length === 0) {
        return [];
      }
      let charsIndex = new Map();
      for (let i = 0; i < chars.length; ++i) {
        charsIndex[chars[i]] = i;
      }

      let queryResult = [];
      for (const entry of db.entries) {
        let index1 = charsIndex[entry.char];
        if (index1 !== undefined) queryResult.push([entry, index1]);
        if (entry.char === entry.charSim)
          continue;
        let index2 = charsIndex[entry.charSim];
        if (index2 !== undefined) queryResult.push([entry, index2]);
      }
      queryResult.sort((item1, item2) => {
        let [entry1, index1] = item1;
        let [entry2, index2] = item2;
        if (index1 !== index2)
          return index1 - index2;
        if (entry1.freq !== entry2.freq)
          return entry1.freq - entry2.freq;
        if (entry1.cat !== entry2.cat)
          return entry1.cat - entry2.cat;
        return entry1.index - entry2.index;
      });
      let result = queryResult.map(([entry, index]) => {
        return {
          entry: entry,
          puj: new Pronunciation(entry.pron.initial, entry.pron.final, entry.pron.tone).combination,
          details: entry.details,
        };
      });
      return result;
    },
    queryEntries() {
      let charsInput = this.queryInput;
      let chars = [...charsInput];
      // remove all non-Chinese characters
      // query = query.replace(/[^\u4e00-\u9fa5]/g, "");
      if (chars.length !== 0) {
        setLoading(true);
        let result = this.queryChars(chars);
        this.queryResult = result;
        this.queryResultEmpty = result.length === 0;
        //$("#query-result").children().not("#query-result-proto").remove();
        //result.forEach(entry => {
        //  $("#query-result").append(makeEntryArea(entry));
        //});
        setLoading(false);
        setUrlQueryParameter("chars", charsInput);
      }
    },
    resetQuery() {
      this.queryInput = '';
      resetUrlQueryParameter("chars");
    },
    onInitFromDatabaseFinished() {
      setLoading(false);
      // get the GET parameter in url
      let searchParams = new URLSearchParams(window.location.search);
      let query = searchParams.get("chars");
      if (query !== null) {
        this.queryInput = query;
        this.queryEntries();
      }
    },
  },
  mounted() {
    initFromDatabase().then(this.onInitFromDatabaseFinished);

    $("#reset-button").click(function () {
      this.blur();
    });

    $("#query-button").click(function () {
      this.blur();
    });
  }
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
