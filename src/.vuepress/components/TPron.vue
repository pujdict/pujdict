<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form id="query-conditions" class="row g-3">
      <div class="mb-auto">
        <div class="form-label"><b>口音偏好</b></div>
        <div id="fuzzy-query" class="query-filter-list">
          <div class="form-check form-check-inline offset-sm-0" v-for="fuzzyQuery in fuzzyQueryList">
            <input class="form-check-input" type="radio"
                   :id="fuzzyQuery.key" :value="fuzzyQuery.key"
                   v-model="selectedFuzzyQueryKey"
                   @change="updateFuzzyRulesMap()"/>
            <label class="form-check-label" :for="fuzzyQuery.key">{{ fuzzyQuery.name }}</label>
          </div>
        </div>
      </div>
      <div class="mb-auto">
        <div class="form-label"><b>拼音方案</b></div>
        <div id="pinyin" class="query-filter-list">
          <div class="form-check form-check-inline offset-sm-0" v-for="py in pinyinList">
            <input class="form-check-input" type="radio"
                   :id="py.key" :value="py.key"
                   v-model="selectedPinyin"
                   @change="updateFuzzyRulesMap()"/>
            <label class="form-check-label" :for="py.key">{{ py.name }}</label>
          </div>
        </div>
      </div>
      <div class="mb-auto" v-if="initialsList">
        <div class="form-label"><b>声母</b></div>
        <div id="initials-list" class="query-filter-list">
          <div class="form-check form-check-inline" v-for="initial in initialsList">
            <input class="form-check-input" type="checkbox"
                   :id="initial.key" :value="initial.key" v-model="selectedInitials"/>
            <label class="form-check-label" :for="initial.key">{{ initial.display }}</label>
          </div>
        </div>
      </div>
      <div class="mb-auto" v-if="finalsList">
        <div class="form-label"><b>韵母</b></div>
        <div id="finals-list" class="query-filter-list">
          <div class="form-check form-check-inline" v-for="final in finalsList">
            <input class="form-check-input" type="checkbox"
                   :id="final.key" :value="final.key" v-model="selectedFinals"/>
            <label class="form-check-label" :for="final.key">{{ final.display }}</label>
          </div>
        </div>
      </div>
      <div class="mb-auto" v-if="tonesList">
        <div class="form-label"><b>声调</b></div>
        <div id="tones-list" class="query-filter-list">
          <div class="form-check form-check-inline" id="tones-list-proto" v-for="tone in tonesList">
            <input class="form-check-input" type="checkbox"
                   :id="tone.key" :value="tone.key" v-model="selectedTones"/>
            <label class="form-check-label" :for="tone.key">{{ tone.display }}</label>
          </div>
        </div>
      </div>
      <div class="btn-toolbar">
        <div class="btn-group" v-if="tonesList">
          <input id="query-button" class="btn btn-outline-primary" type="button" value="查询" @click="querySqlite"/>
          <input id="reset-button" class="btn btn-outline-danger" type="button" value="重置" @click="resetQuery"/>
        </div>
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <hr/>
    <div id="query-result">
      <div v-if="queryResultEmpty">没有找到符合条件的结果。</div>
      <div v-else>
        <ul>
          <li v-for="(item, key) in queryResult" :key="key">
            <span v-if="selectedPinyin === 'puj'">{{ convertPlainPUJSentenceToDisplayPUJSentence(key) }}:</span>
            <span v-else>{{ convertPUJToDPSentence(key).slice(0, -1) }}</span>
            <span v-for="(toneItem, tone) in item" :key="tone">
              <span class="tone-number">{{ makeResultTone(tone) }}</span>
              <span class="query-result-entry" v-for="entry in toneItem">
                <a target="_blank" :class="`query-result-entry-${entry.cat}`" :href="withBase('query/qchar.html?chars=' + entry.char)">
                  <span>{{ entry.char_sim }}</span>
                  <span v-if="entry.char_sim !== entry.char" style="font-size: 0.85em">({{ entry.char }})</span>
                </a>
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import {withBase} from "vuepress/client";
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
</script>

<script>
import {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  // $,
  db, combinations,
} from './QCommon.vue';
import {
  fuzzyRules,
  convertPlainPUJSentenceToDisplayPUJSentence,
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  convertPUJToDPSentence,
  convertPUJPronunciationToDPPronunciation,
  convertPlainPUJToPronunciationWord,
  convertPUJInitialOrFinalToDP,
} from './SPuj.js';
import jquery from 'jquery';

const $ = jquery;

export default {
  data() {
    return {
      pinyinList: [
        {
          key: "puj",
          name: "PUJ",
        },
        {
          key: "dp",
          name: "潮拼",
        },
      ],
      fuzzyQueryList: Object.entries(fuzzyRules).map(([key, rule]) => ({
        key,
        name: rule.name,
        fuzzy: rule.fuzzy,
      })),
      selectedFuzzyQueryKey: getLocalOption("fuzzy-query") ?? 'dummy',
      selectedPinyin: 'puj',
      initialsList: {},
      finalsList: {},
      tonesList: {},
      selectedInitials: [],
      selectedFinals: [],
      selectedTones: [],
      fuzzyRulesMap: {},
      fuzzyRulesMapReverse: {},
      queryResult: {},
      queryResultEmpty: false,
    };
  },
  computed: {
    initialsKeys() {
      return Array.from(this.initialsList).map(item => item.key);
    },
    finalsKeys() {
      return Array.from(this.finalsList).map(item => item.key);
    },
    tonesKeys() {
      return Array.from(this.tonesList).map(item => item.key);
    },
  },
  methods: {
    updateFuzzyRulesMap() {
      let ruleKey = this.selectedFuzzyQueryKey;
      let rule = fuzzyRules[ruleKey];
      this.fuzzyRulesMap = {};
      this.fuzzyRulesMapReverse = {};
      let fuzzyInitials = new Set();
      let fuzzyFinals = new Set();
      let fuzzyTones = new Set();
      for (let i = 0; i < combinations.length; i++) {
        let combination = combinations[i];
        let fuzzy = rule.fuzzy(combination);
        let fuzzyString = fuzzy.initial + fuzzy.final + fuzzy.tone;
        let originalString = combination.initial + combination.final + combination.tone;
        this.fuzzyRulesMap[originalString] = fuzzy;
        if (this.fuzzyRulesMapReverse[fuzzyString] === undefined) {
          this.fuzzyRulesMapReverse[fuzzyString] = [];
        }
        this.fuzzyRulesMapReverse[fuzzyString].push(combination);

        fuzzyInitials.add(fuzzy.initial);
        fuzzyFinals.add(fuzzy.final);
        fuzzyTones.add(fuzzy.tone);

        let fuzzyStringWithoutTone = fuzzy.initial + fuzzy.final;
        if (this.fuzzyRulesMapReverse[fuzzyStringWithoutTone] === undefined) {
          let originalWithoutTone = structuredClone(combination);
          let originalStringWithoutTone = combination.initial + combination.final;
          let fuzzyWithoutTone = structuredClone(fuzzy);
          this.fuzzyRulesMapReverse[fuzzyStringWithoutTone] = [originalWithoutTone];
          fuzzyWithoutTone.tone = "";
          this.fuzzyRulesMap[originalStringWithoutTone] = fuzzyWithoutTone;
        }
      }
      fuzzyInitials = [...fuzzyInitials].sort();
      // 目前的各地口音暂不需要区别，按这个固定的顺序来。
      // （唇齿音作为自由变体暂不考虑引入，等有朝一日轻重唇真正意义上产生对立了再说吧）
      fuzzyInitials = ['p', 'ph', 'm', 'b', 't', 'th', 'n', 'l', 'k', 'kh', 'ng', 'g', 'h', 'ts', 'tsh', 's', 'j', '0',]
      fuzzyFinals = [...fuzzyFinals].sort();
      fuzzyTones = [...fuzzyTones].sort();

      if (this.selectedPinyin === 'dp') {
        this.initialsList = fuzzyInitials.map(item => {
          return {key: item, display: convertPUJInitialOrFinalToDP(item)};
        });
        this.finalsList = fuzzyFinals.map(item => {
          return {key: item, display: convertPUJInitialOrFinalToDP(item)};
        });
        this.tonesList = fuzzyTones.map(item => {
          return {key: item, display: item};
        });
      } else {
        this.initialsList = fuzzyInitials.map(item => {
          return {key: item, display: item};
        });
        this.finalsList = fuzzyFinals.map(item => {
          return {key: item, display: convertPlainPUJSentenceToDisplayPUJSentence(item)};
        });
        this.tonesList = fuzzyTones.map(item => {
          return {key: item, display: item};
        });
      }
      // 重新设置选项 cookie
      setLocalOption("fuzzy-query", ruleKey);
    },
    async initialSelectFromGetParameters() {
      // components using url components string
      let searchParams = new URLSearchParams(window.location.search);
      let queryFuzzy = searchParams.get("fuzzy");
      let queryInitials = searchParams.get("initials");
      let queryFinals = searchParams.get("finals");
      let queryTones = searchParams.get("tones");
      // components if any of them is not null
      if (queryInitials !== null || queryFinals !== null || queryTones !== null) {
        if (queryFuzzy !== null) {
          // $("#fuzzy-query-" + queryFuzzy).attr("checked", "checked");
          this.selectedFuzzyQueryKey = queryFuzzy;
          this.updateFuzzyRulesMap(queryFuzzy);
        }
        if (queryInitials !== null && queryInitials !== '') {
          queryInitials = queryInitials.split(",");
          for (let i = 0; i < queryInitials.length; i++) {
            // $("#initial-" + queryInitials[i]).attr("checked", "checked");
            this.selectedInitials.push(queryInitials[i]);
          }
        }
        if (queryFinals !== null && queryFinals !== '') {
          queryFinals = queryFinals.split(",");
          for (let i = 0; i < queryFinals.length; i++) {
            // $("#final-" + queryFinals[i]).attr("checked", "checked");
            this.selectedFinals.push(queryFinals[i]);
          }
        }
        if (queryTones !== null && queryTones !== '') {
          queryTones = queryTones.split(",");
          for (let i = 0; i < queryTones.length; i++) {
            // $("#tone-" + queryTones[i]).attr("checked", "checked");
            this.selectedTones.push(queryTones[i]);
          }
        }
        await this.querySqlite();
      } else {
        this.updateFuzzyRulesMap(this.selectedFuzzyQueryKey);
      }
    },
    async querySqlite() {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return;
      }
      setLoading(true);

      let resultEntries = [];
      let fuzzyName = this.selectedFuzzyQueryKey;

      this.setUrlQueryParameterPron(fuzzyName, ...this.getQueryConditionList(false));
      let [queryInitials, queryFinals, queryTones, queryAll] = this.getQueryConditionList(true);
      // append to url
      if (queryAll) { // quick components all
        let querySql = "SELECT * FROM entries";
        let sqlResult = db.exec(querySql);
        if (sqlResult) {
          let queryResultEntries = sqlResult[0].values;
          for (let i = 0; i < queryResultEntries.length; i++) {
            let entryData = queryResultEntries[i];
            let entry = makeEntryFromSqlResult(entryData);
            resultEntries.push(entry);
          }
        }
      } else {
        // change another components way: create a tmp words table, then components from it
        let dropTmpTableIfExistSql = "DROP TABLE IF EXISTS tmp_combinations";
        db.exec(dropTmpTableIfExistSql);
        let createTmpTableSql = "CREATE TEMPORARY TABLE tmp_combinations (combination)";
        db.exec(createTmpTableSql);

        let insertTmpTableSql = "INSERT INTO tmp_combinations VALUES ";
        let insertTmpTableSqlValues = new Set();
        let sqlResult = null;
        let fuzzyRulesMapReverse = this.fuzzyRulesMapReverse;
        for (let i = 0; i < queryInitials.length; i++) {
          let curInitial = queryInitials[i];
          for (let j = 0; j < queryFinals.length; j++) {
            let curFinal = queryFinals[j];
            for (let k = 0; k < queryTones.length; k++) {
              let curTone = queryTones[k];
              let curCombination = curInitial + curFinal + curTone;
              if (fuzzyRulesMapReverse[curCombination] === undefined) {
                continue;
              }
              let curFuzzyList = fuzzyRulesMapReverse[curCombination];
              for (let l = 0; l < curFuzzyList.length; l++) {
                let curFuzzy = curFuzzyList[l];
                insertTmpTableSqlValues.add(`("${curFuzzy.combination}")`);
              }
              // avoid too many values in one sql
              if (insertTmpTableSqlValues.size > 1000) {
                db.exec(insertTmpTableSql + [...insertTmpTableSqlValues].join(","));
                insertTmpTableSqlValues = new Set();
              }
            }
          }
        }
        if (insertTmpTableSqlValues.size > 0) {
          db.exec(insertTmpTableSql + [...insertTmpTableSqlValues].join(","));
        }

        // now, select all hit entries that match the pronunciation
        let querySql = "SELECT * FROM entries WHERE entries.initial||entries.final||entries.tone IN (SELECT combination FROM tmp_combinations)";
        sqlResult = db.exec(querySql);
        if (sqlResult && sqlResult[0]) {
          let queryResultEntries = sqlResult[0].values;
          for (let i = 0; i < queryResultEntries.length; i++) {
            let entryData = queryResultEntries[i];
            let entry = makeEntryFromSqlResult(entryData);
            resultEntries.push(entry);
          }
        }
        let dropTmpTableSql = "DROP TABLE tmp_combinations";
        sqlResult = db.exec(dropTmpTableSql);
      }
      this.showQueryResultList(resultEntries);
      setLoading(false);
    },
    resetQuery() {
      this.selectedInitials = [];
      this.selectedFinals = [];
      this.selectedTones = [];
      this.resetUrlQueryParameterPron();
    },
    resetUrlQueryParameterPron() {
      resetUrlQueryParameter("fuzzy");
      resetUrlQueryParameter("initials");
      resetUrlQueryParameter("finals");
      resetUrlQueryParameter("tones");
    },
    setUrlQueryParameterPron(queryFuzzy, queryInitials, queryFinals, queryTones) {
      setUrlQueryParameter("fuzzy", queryFuzzy);
      setUrlQueryParameter("initials", queryInitials.join(","));
      setUrlQueryParameter("finals", queryFinals.join(","));
      setUrlQueryParameter("tones", queryTones.join(","));
    },
    showQueryResultList(resultEntries) {
      this.queryResultEmpty = resultEntries.length === 0;
      // initial+final -> {tone -> [entryIds]}
      resultEntries.sort((a, b) => a.combination.localeCompare(b.combination));
      let queryResult = {};
      let fuzzyRulesMap = this.fuzzyRulesMap;
      for (let i = 0; i < resultEntries.length; i++) {
        let entry = resultEntries[i];
        let fuzzy = fuzzyRulesMap[entry.initial + entry.final + entry.tone];
        if (queryResult[fuzzy.initial + fuzzy.final] === undefined) {
          queryResult[fuzzy.initial + fuzzy.final] = {};
        }
        if (queryResult[fuzzy.initial + fuzzy.final][fuzzy.tone] === undefined) {
          queryResult[fuzzy.initial + fuzzy.final][fuzzy.tone] = [];
        }
        queryResult[fuzzy.initial + fuzzy.final][fuzzy.tone].push(entry);
      }
      // sort the map by key initial+final
      let keys = Object.keys(queryResult);
      keys.sort();
      let sortedQueryResult = {};
      for (let i = 0; i < keys.length; i++) {
        sortedQueryResult[keys[i]] = queryResult[keys[i]];
      }

      this.queryResult = sortedQueryResult;
    },
    getQueryConditionList(selectAllForEmpty) {
      let emptyCount = 0;
      let selectedInitials = this.selectedInitials;
      if (selectedInitials.length === 0 && selectAllForEmpty) {
        selectedInitials = this.initialsKeys;
        ++emptyCount;
      }
      let selectedFinals = this.selectedFinals;
      if (selectedFinals.length === 0 && selectAllForEmpty) {
        selectedFinals = this.finalsKeys;
        ++emptyCount;
      }
      let selectedTones = this.selectedTones;
      if (selectedTones.length === 0 && selectAllForEmpty) {
        selectedTones = this.tonesKeys;
        ++emptyCount;
      }
      if (emptyCount === 3) {
        return [selectedInitials, selectedFinals, selectedTones, true];
      }
      return [selectedInitials, selectedFinals, selectedTones, false];
    },
    makeResultTone(tone) {
      const map = "⓪①②③④⑤⑥⑦⑧";
      tone = parseInt(tone);
      if (tone < 0 || tone > 8) {
        return "";
      }
      return map[tone];
    },
  },
  mounted() {
    $("#reset-button").click(function () {
      this.blur();
    });
    $("#query-button").click(function () {
      this.blur();
    });
    initFromDatabase().then(() => {
      setLoading(false);
    }).then(this.initialSelectFromGetParameters);
  }
}
</script>

<style scoped lang="scss">
$link-decoration: none;
@import 'bootstrap/scss/bootstrap';
</style>

<style lang="scss">
.query-filter-list * {
  /* add hover mouse icon */
  cursor: pointer;
}

#query-conditions {
  font-size: 110%;
}

#query-conditions .form-check-label {
  /* add margin between every two entries */
  width: 2.4em;
}

#query-result {
  font-size: 130%;
}

/* add left margin 4px and right margin 2px */
#query-result .tone-number {
  margin: 0 2px 0 4px;
}

/* add margin between every two entries */
#query-result .query-result-entry {
  margin: 0 3px 0 3px;
}

#query-result .query-result-entry-0 {
  text-decoration: none;
}

#query-result .query-result-entry-1 {
  text-decoration: underline;
}

#query-result .query-result-entry-2 {
  text-decoration: double underline;
}

#query-result .query-result-entry-3 {
  text-decoration: wavy underline;
}

</style>
