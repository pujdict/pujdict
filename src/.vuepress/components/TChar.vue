<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form class="row g-3" onsubmit="return false;">
      <div class="query-input-area">
        <!-- 长度充满整个div -->
        <input class="form-control" id="query-input" type="text" placeholder="输入汉字..." maxlength="256" v-model="queryInput"/>
      </div>

      <div class="btn-toolbar">
        <div class="btn-group">
          <input id="query-button" class="btn btn-outline-primary" type="submit" value="查询" @click="queryEntries"/>
          <input id="reset-button" class="btn btn-outline-danger" type="button" value="重置" @click="resetQuery"/>
        </div>
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <hr/>
    <div id="query-result">
      <div v-if="queryResultEmpty">没有找到符合条件的结果。</div>
      <div v-else>
        <div class="card border-dark mb-3" v-for="result in queryResult">
          <!--        <div class="card-header"></div>&lt;!&ndash;字&ndash;&gt;-->
          <div class="card-body">
            <div class="card-title">
              <span style="font-size: 1.8em">{{ result.entry.charSim }}</span>
              <span style="font-size: 1.25em">{{ result.entry.charSim !== result.entry.char ? ` (${result.entry.char})` : '' }}</span>
              <span style="font-size: 1.25em">{{ result.entry.charRef ? ` [${result.entry.charRef}]` : '' }}</span>
              <span style="font-size: 0.8em; margin: 0 0 0 10px">
                <span v-if="result.entry.cat === 0"></span>
                <span v-if="result.entry.cat === 1"> [白] </span>
                <span v-if="result.entry.cat === 2"> [文] </span>
                <span v-if="result.entry.cat === 3"> [俗] </span>
              </span>
              <span>
                <span v-if="result.entry.freq === 0">★★★</span>
                <span v-if="result.entry.freq === 1">★★☆</span>
                <span v-if="result.entry.freq === 2">★☆☆</span>
                <span v-if="result.entry.freq === 3">☆☆☆</span>
              </span>
            </div>
            <button class="btn active dropdown-toggle"
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
            </button>
            <div class="row">
              <div class="collapse" :id="`entryCollapse${result.entry.index}`">
                <div class="card card-body">
                  <span v-for="(pronunciation, key) in result.pronunciations" :key="key">
                    <template v-if="key !== 'dummy'">
                      <span style="font-size: 80%">{{ pronunciation.name }}: </span>
                      {{ pronunciation.display }};
                      <template v-if="key !== 'custom'">
                        <!-- 自定义可能改到声母（如 ts -> ch），不提供自动转为潮拼。 -->
                        {{ pronunciation.display_dp }};
                        {{ pronunciation.display_ipa }};
                        {{ pronunciation.display_fq }}
                      </template>
                    </template>
                  </span>
                </div>
              </div>
            </div>
            <p class="card-text">
              <template v-for="(details, i) in result.details">
                <br v-if="i > 0"/>
                <span v-if="details.meaning">{{ details.meaning }}<template v-if="details.examples.length">：</template></span>
                <template v-for="(example, j) in details.examples">
                  <template v-if="j > 0">；</template>
                  <span v-if="example.teochew">{{ example.teochew }}</span>
                  <span v-if="example.puj">
                    <span> [{{ addPUJToneMarkAndConvertToDisplayPUJSentence(example.puj) }}] </span>
                  </span>
                  <span v-if="example.mandarin">
                    <span> ({{ example.mandarin }})</span>
                  </span>
                </template>
              </template>
            </p>
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