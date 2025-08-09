<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container py-4">
    <form class="row g-3 mb-4" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="input-group">
          <input class="form-control form-control-lg" id="query-input" type="text" placeholder="输入汉字..."
                 maxlength="256" v-model="queryInput"/>
          <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryEntries">
            <i class="bi bi-search"></i> 查询
          </button>
          <button id="reset-button" class="btn btn-outline-danger" type="button" @click="resetQuery">
            <i class="bi bi-x-circle"></i> 重置
          </button>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center">
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <div id="query-result" class="mt-4">
      <div v-if="queryResultEmpty" class="alert alert-info">没有找到符合条件的结果。</div>
      <div v-else class="row g-4">
        <div class="col-12" v-for="result in queryResult">
          <div class="card shadow-sm">
            <div class="card-header bg-transparent">
              <div class="d-flex align-items-center">
                <h3 class="mb-1 me-3">{{ result.entry.charSim }}</h3>
                <span class="text-muted me-2"
                      v-if="result.entry.charSim !== result.entry.char">({{ result.entry.char }})</span>
                <span class="text-muted me-2" v-if="result.entry.charRef">[{{ result.entry.charRef }}]</span>
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
              <div class="card-body">
                <button class="btn btn-outline-primary mb-2 w-100 text-start dropdown-toggle"
                        type="button"
                        data-bs-toggle="collapse"
                        :data-bs-target="`#entryCollapse${result.entry.index}`"
                        aria-expanded="false"
                        :aria-controls="`entryCollapse${result.entry.index}`">
                <span v-for="(pronunciation, key) in result.pronunciations" :key="key">
                  <template v-if="key === 'dummy'">
                    {{ result.pronunciation_display }};
                    {{ result.pronunciation_dp.combination }};
                    [{{ result.pronunciation_ipa.combination }}];
                    {{ result.pronunciation_fq.combination }}
                  </template>
                </span>
                  <i class="bi bi-chevron-down float-end"></i>
                </button>

                <div class="collapse mb-3" :id="`entryCollapse${result.entry.index}`">
                  <div class="card card-body">
                    <div class="row g-2">
                    <span v-for="(pronunciation, key) in result.pronunciations" :key="key">
                      <template v-if="key !== 'dummy'">
                        <div class="col-12">
                          <span class="badge border border-primary text-primary">{{ pronunciation.name }}</span>
                          {{ pronunciation.display }};
                          <template v-if="key !== 'custom'">
                            {{ pronunciation.display_dp }};
                            [{{ pronunciation.display_ipa }}];
                            {{ pronunciation.display_fq }}
                          </template>
                        </div>
                      </template>
                    </span>
                    </div>
                  </div>
                </div>

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
                      <span> [{{
                          addPUJToneMarkAndConvertToDisplayPUJSentence(example.puj)
                        }}] </span>
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

<script setup>
import {withBase} from "vuepress/client";
import TDarkTheme from "./TDarkTheme.vue";
</script>

<script>
import {
  Entry, Pronunciation,
  getFuzzyRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db, entries, accents, entriesCount, initials, finals, combinations,
  isChineseChar,
} from './QCommon.vue';
import {
  convertPlainPUJSentenceToDisplayPUJSentence,
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  convertPUJToDPSentence,
  convertPUJPronunciationToDPPronunciation,
  convertPUJPronunciationToFanQiePronunciation,
  convertPUJPronunciationToIPAPronunciation,
} from './SPuj.js';
import {darkThemeString} from "./QDarkTheme.vue";
import jquery from 'jquery';

const $ = jquery;

export default {
  data() {
    return {
      queryInput: '',
      queryResult: {},
      queryResultEmpty: false,
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
    makeCombinationString(pron) {
      return `${pron.initial}${pron.final}${pron.tone}`;
    },
    queryChars(chars) {
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
      for (const entry of entries) {
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
        let pronunciations = {};
        let pron = entry.pron;
        const pronunciation = new Pronunciation(pron.initial, pron.final, pron.tone);
        Object.entries(getFuzzyRules()).forEach(([key, rule]) => {
          let fuzzyPronunciation = getFuzzyPronunciation(key, entry);
          let combination = this.makeCombinationString(fuzzyPronunciation);
          let display = addPUJToneMarkAndConvertToDisplayPUJSentence(combination);
          pronunciations[key] = {
            key: key,
            name: rule.name,
            raw: fuzzyPronunciation,
            plain: combination,
            display: display,
            display_dp: convertPUJPronunciationToDPPronunciation(fuzzyPronunciation).combination,
            display_fq: convertPUJPronunciationToFanQiePronunciation(fuzzyPronunciation, pronunciation).combination,
            display_ipa: convertPUJPronunciationToIPAPronunciation(fuzzyPronunciation).combination,
          };
        });
        return {
          entry: entry,
          pronunciation: pronunciation,
          pronunciation_display: addPUJToneMarkAndConvertToDisplayPUJSentence(pronunciation.combination),
          pronunciation_dp: convertPUJPronunciationToDPPronunciation(pronunciation),
          pronunciation_fq: convertPUJPronunciationToFanQiePronunciation(pronunciation),
          pronunciation_ipa: convertPUJPronunciationToIPAPronunciation(pronunciation),
          pronunciations: pronunciations,
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
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
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