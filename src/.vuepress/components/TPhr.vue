<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="container py-4">
    <form class="row g-3 mb-4" onsubmit="return false;">
      <div class="query-input-area col-md-8">
        <div class="input-group">
          <input class="form-control form-control-lg" id="query-input" type="text" placeholder="输入字词..."
                 maxlength="256" v-model="queryInput"/>
          <button id="query-button" class="btn btn-outline-primary" type="submit" @click="queryPhrases">
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
    <div id="query-result" class="mt-4">
      <div v-if="queryResultEmpty" class="alert alert-info">没有找到符合条件的结果。</div>
      <div v-else class="row g-4">
        <div class="col-12" v-for="result in queryResult">
          <div class="card shadow-sm">
            <div class="card-header bg-transparent">
              <div class="d-flex align-items-center">
                <h3 class="mb-1 me-2">
                  <template v-for="(char, i) in result.teochew">
                    <template v-if="i">・</template>{{ char }}
                  </template>
                </h3>
                <span class="me-1" v-for="(p, i) in result.puj">
                  <TPopupPuj :puj="p"/>
                </span>
                <span class="text-muted me-1">
                  <template v-for="(cmn, i) in result.cmn">
                    <template v-if="i">；</template>{{ cmn }}
                  </template>
                </span>
              </div>
              <div class="card-body" style="padding: 10px 0">
                <div class="card-text">
                  <div>
                    <span v-if="result.desc" v-html="result.desc"></span>
                    <template v-for="(example, iExample) in result.examples">
                      <div class="border-top my-2"></div>
                      <span class="me-1" v-if="example.teochew">{{ example.teochew }}</span>
                      <span class="me-1" v-if="example.puj"><TPopupPuj :puj="example.puj"/></span>
                      <span class="me-1 text-muted" v-if="example.mandarin">{{ example.mandarin }}</span>
                    </template>
                  </div>
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
import TPopupPuj from "./TPopupPuj.vue";
import {createVNode, render} from 'vue';
import {
  Entry, Pronunciation,
  getAccentsRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db, entries, accents, phrases, entriesCount, initials, finals, combinations,
  isChineseChar,
} from './QCommon.vue';
import {
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  convertPUJToDPSentence,
  convertPUJPronunciationToDPPronunciation,
  convertPUJPronunciationToFanQiePronunciation,
  convertPUJPronunciationToIPAPronunciation,
  convertPlainPUJSentenceToPUJSentence,
  convertPlainPUJSentenceToDPSentence,
} from './SPuj.js';
import {darkThemeString} from "./QDarkTheme.vue";
import jquery from 'jquery';

const $ = jquery;

export default {
  data() {
    return {
      queryInput: '',
      queryResult: [],
      queryResultEmpty: false,
      teochewIndexing: {},
      cmnIndexing: {},
      pujIndexing: {},
      activePopupPhraseIndex: -1,
      activePopupPronunciationIndex: -1,
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
    formatDesc(desc: string) {
      if (!desc) return '';
      let result = desc;
      // get all things in @{...}
      const pujRegExp = /@\{([^}]+)\}/g;
      const matches = desc.matchAll(pujRegExp);
      for (const match of matches) {
        const fullMatch = match[0];
        const content = match[1];
        const replacement = `<span data-puj="${content}"></span>`;
        result = result.replace(fullMatch, replacement);
      }
      return result;
    },
    renderPopupPujElements() {
      const elements = document.querySelectorAll('[data-puj]');
      elements.forEach((element) => {
        const puj = element.getAttribute('data-puj');
        const vNode = createVNode(TPopupPuj, { puj });
        const span = document.createElement('span');
        render(vNode, span);
        element.replaceWith(span);
      });
    },
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
        const desc = this.formatDesc(phrase.desc);
        result.push({
          index: phrase.index,
          teochew: phrase.teochew,
          puj: phrase.puj,
          cmn: phrase.cmn,
          desc: desc,
          examples: phrase.examples,
        });
      }
      return result;
    },
    queryPhrases() {
      this.queryResult = [];
      this.renderPopupPujElements();
      let charsInput = this.queryInput;
      let phrases = charsInput.split([' ', ',']);
      let result = [];
      for (const phrase of phrases) {
        result.push(...this.queryPhrase(phrase));
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
        const teochew_list = phrase.teochew;
        const puj_list = phrase.puj;
        const cmn_list = phrase.cmn;
        for (let teochew of teochew_list) {
          pushIndex(this.teochewIndexing, teochew, phrase);
        }
        for (let puj of puj_list) {
          pushIndex(this.pujIndexing, puj, phrase);
        }
        for (const cmn of cmn_list) {
          pushIndex(this.cmnIndexing, cmn, phrase);
        }
      }
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
    initFromDatabase().then(() => {
      this.onInitFromDatabaseFinished();
      this.renderPopupPujElements();
    });

    $("#reset-button").click(function () {
      this.blur();
    });

    $("#query-button").click(function () {
      this.blur();
    });
  },
  updated() {
    this.renderPopupPujElements();
  },
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
//@import 'bootstrap-icons/font/bootstrap-icons.min.css';
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
