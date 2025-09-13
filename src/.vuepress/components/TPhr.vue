<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container py-4">
    <form class="row g-3 mb-4" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="input-group">
          <input class="form-control form-control-lg" id="query-input" type="text" placeholder="输入字词..."
                 maxlength="256" v-model="queryInput"/>
          <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryPhrases">
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
                <h3 class="mb-1 me-3">{{ result.teochew }}</h3>
                <span class="text-muted me-2">[{{ result.puj }}]</span>
              </div>
              <div class="card-body">
                <!--
                <button class="btn btn-outline-primary mb-2 w-100 text-start dropdown-toggle"
                        type="button"
                        data-bs-toggle="collapse"
                        :data-bs-target="`#entryCollapse${result.phrase.index}`"
                        aria-expanded="false"
                        :aria-controls="`entryCollapse${result.phrase.index}`">
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
                -->
                <!--
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
                -->
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
</script>

<script lang="ts">
import {
  Entry, Pronunciation,
  getFuzzyRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db, entries, accents, phrases, entriesCount, initials, finals, combinations,
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
      teochewIndexing: {},
      cmnIndexing: {},
      pujIndexing: {},
    };
  },
  watch: {
    // remove all non-Chinese characters
    // queryInput(newVal, oldVal) {
    //   if (newVal !== oldVal) {
    //     this.queryInput = newVal.split('').filter(isChineseChar).join('');
    //   }
    // }
  },
  methods: {
    queryPhrase(chars) {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return [];
      }
      // verify input and convert to array
      if (chars.length === 0) {
        return [];
      }
      let result = [];
      let resultPhrases = [];
      let resultPhrasesIndices = new Set();
      let pushResult = (phrase) => {
        if (resultPhrasesIndices.has(phrase.index)) return;
        resultPhrasesIndices.add(phrase.index);
        resultPhrases.push(phrase);
      };
      for (const [key, phrases] of Object.entries(this.teochewIndexing)) {
        if (key.includes(chars)) {
          for (const phrase of phrases) {
            pushResult(phrase);
          }
        }
      }
      for (const [key, phrases] of Object.entries(this.cmnIndexing)) {
        if (key.includes(chars)) {
          for (const phrase of phrases) {
            pushResult(phrase);
          }
        }
      }
      for (const phrase of resultPhrases) {
        result.push({
          teochew: phrase.teochew,
          puj: addPUJToneMarkAndConvertToDisplayPUJSentence(phrase.puj),
          desc: phrase.desc,
          cmn: phrase.cmn,
          char_var: phrase.char_var,
          puj_var: phrase.puj_var,
        });
      }
      return result;
    },
    queryPhrases() {
      let charsInput = this.queryInput;
      let phrases = charsInput.split([' ', ',']);
      let result = [];
      for (const phrase of phrases) {
        result = result.concat(this.queryPhrase(phrase));
      }
      this.queryResult = result;
    },
    resetQuery() {
      this.queryInput = '';
    },
    onInitFromDatabaseFinished() {
      setLoading(false);
      let pushIndex = (indexing, key, value) => {
        if (!indexing[key]) indexing[key] = [];
        indexing[key].push(value);
      }
      for (const phrase of phrases) {
        const teochew = phrase.teochew;
        const char_var = phrase.char_var;
        const cmn_list = phrase.cmn;
        pushIndex(this.teochewIndexing, teochew, phrase);
        for (let char in char_var) {
          pushIndex(this.teochewIndexing, char, phrase);
        }
        for (const cmn of cmn_list) {
          pushIndex(this.cmnIndexing, cmn, phrase);
        }
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