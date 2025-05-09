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
            <h4 class="card-title">{{
                result.entry.char_sim
              }}{{ result.entry.char_sim !== result.entry.char ? ` (${result.entry.char})` : '' }}</h4>
            <button class="btn active dropdown-toggle"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#entryCollapse${result.entry.entry_index}`"
                    aria-expanded="false"
                    :aria-controls="`entryCollapse${result.entry.entry_index}`">
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
              <div class="collapse" :id="`entryCollapse${result.entry.entry_index}`">
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
              <template v-for="(meaningItem, i) in result.meaningItem">
                <br v-if="i > 0"/>
                <span v-if="meaningItem.meaning">{{ meaningItem.meaning }}<template v-if="meaningItem.examples.length">：</template></span>
                <template v-for="(example, j) in meaningItem.examples">
                  <template v-if="j > 0">；</template>
                  <span v-if="example.teochew">{{ example.teochew }}</span>
                  <span v-if="example.puj">
                    <span> [{{ example.puj }}] </span>
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
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  // $,
  db, entriesCount, initials, finals, combinations,
  isChineseChar,
} from './QCommon.vue';
import {
  fuzzyRules,
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
// import 'jquery.cookie';

const $ = jquery;

// import 'bootstrap';
// import 'khroma';

class MeaningWord {
  constructor(teochew, puj, mandarin) {
    this.teochew = teochew;
    this.puj = puj;
    this.mandarin = mandarin;
  }
}

class MeaningItem {
  constructor(meaning, words) {
    this.meaning = meaning;
    this.words = words;
  }
}

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
    queryChars(chars) {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return [];
      }
      // verify input and convert to array
      if (chars.length === 0) {
        return [];
      }
      let dropTmpTableIfExistSql = "DROP TABLE IF EXISTS tmp_chars";
      db.exec(dropTmpTableIfExistSql);
      let createTmpTableSql = "CREATE TEMPORARY TABLE tmp_chars (char TEXT, order_id INTEGER)";
      db.exec(createTmpTableSql);

      let insertCharsSql = "INSERT INTO tmp_chars VALUES ";
      let conditions = [];
      for (let i = 0; i < chars.length; i++) {
        let curCondition = `('${chars[i]}', ${i + 1})`;
        conditions.push(curCondition);
      }
      insertCharsSql += conditions.join(",");
      db.exec(insertCharsSql);

      let querySql = `
        SELECT *
        FROM entries
               JOIN tmp_chars ON
          entries.char = tmp_chars.char OR entries.char_sim = tmp_chars.char
        ORDER BY tmp_chars.order_id, entries.char, entries.initial || entries.final || initial || tone DESC
      `;
      let queryResult = db.exec(querySql);
      if (queryResult.length === 0) {
        return [];
      }
      let result = queryResult[0].values.map(row => {
        let entry = new Entry(...row);
        let pronunciations = {};
        const pronunciation = new Pronunciation(entry.initial, entry.final, entry.tone);
        Object.entries(fuzzyRules).forEach(([key, rule]) => {
          let fuzzyPronunciation = rule.fuzzy(pronunciation);
          let combination = fuzzyPronunciation.combination;
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
          meaningItem: entry.details.meanings,
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

    function makeMeaningWord(str) {
      // 词例@注音@释义
      let result = $("<span></span>");
      let word;
      let pronunciation;
      let meaning;
      let splits = str.split('@');
      if (splits.length >= 1) {
        word = splits[0];
      }
      if (splits.length >= 2) {
        pronunciation = splits[1];
      }
      if (splits.length >= 3) {
        meaning = splits[2];
      }
      // word 标注 pronunciation, 加一个括号包 meaning
      if (word !== undefined) {
        let wordSpan = $("<span></span>");
        wordSpan.text(word);
        if (pronunciation !== undefined) {
          let pronunciationText = addPUJToneMarkAndConvertToDisplayPUJSentence(pronunciation);
          let pronunciationSpan2 = $("<span></span>");
          pronunciationSpan2.text(` [${pronunciationText}]`);
          wordSpan.append(pronunciationSpan2);
        }
        if (meaning !== undefined) {
          let meaningSpan = $("<span></span>");
          meaningSpan.text(` (${meaning})`);
          wordSpan.append(meaningSpan);
        }
        result.append(wordSpan);
      }
      return result;
    }
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>