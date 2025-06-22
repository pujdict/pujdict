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
          <input id="query-button" class="btn btn-outline-primary" type="button" value="查询" @click="queryDatabase"/>
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
                <a target="_blank" :class="`query-result-entry-${entry.cat}`"
                   :href="withBase('query/qchar.html?chars=' + entry.char)">
                  <span>{{ entry.charSim }}</span>
                  <span v-if="entry.charSim !== entry.char" style="font-size: 0.85em">({{ entry.char }})</span>
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
  getFuzzyRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db, entries, accents, combinations,
} from './QCommon.vue';
import {
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
      fuzzyQueryList: [],
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
      fuzzyEntriesMap: {},
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
    addFuzzyEntry(fuzzyPron, entry) {
      const key = this.makeCombinationString(fuzzyPron);
      this.fuzzyEntriesMap[key] = this.fuzzyEntriesMap[key] || [];
      this.fuzzyEntriesMap[key].push(entry);
    },
    makeCombinationString(pron) {
      return `${pron.initial}${pron.final}${pron.tone}`;
    },
    updateFuzzyRulesMap() {
      let ruleKey = this.selectedFuzzyQueryKey;
      this.fuzzyRulesMap = {};
      this.fuzzyRulesMapReverse = {};
      let fuzzyInitials = new Set();
      let fuzzyFinals = new Set();
      let fuzzyTones = new Set();
      this.fuzzyEntriesMap = {};
      for (const entry of entries) {
        const fuzzyPron = getFuzzyPronunciation(ruleKey, entry);
        this.addFuzzyEntry(fuzzyPron, entry);
        fuzzyInitials.add(fuzzyPron.initial);
        fuzzyFinals.add(fuzzyPron.final);
        fuzzyTones.add(fuzzyPron.tone);
      }
      // 目前的各地口音暂不需要区别，按这个固定的顺序来。
      // （唇齿音作为自由变体暂不考虑引入，等有朝一日轻重唇真正意义上产生对立了再说吧）
      // fuzzyInitials = [...fuzzyInitials].sort();
      fuzzyInitials = ['p', 'ph', 'm', 'b', 't', 'th', 'n', 'l', 'k', 'kh', 'ng', 'g', 'h', 'ts', 'tsh', 's', 'j', '0',]
      fuzzyFinals = [...fuzzyFinals].sort();
      // fuzzyTones = [...fuzzyTones].sort();
      // 目前的所谓七声调类型的惠来、潮阳，事实上还没有完全变为七声调，他们存在单字调的合并，但在连读变调时，依然能够区分。
      // 所以依然视为独立的声调。用户分不清的时候可以手动选择合并（例如惠来口音，同时选中 3、7 两个声调）。
      fuzzyTones = [1, 2, 3, 4, 5, 6, 7, 8];

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
    initializeAccents() {
      this.fuzzyQueryList = Object.entries(getFuzzyRules()).map(([key, rule]) => ({
        key,
        name: rule.name,
        fuzzy: rule.fuzzy,
      }));
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
        await this.queryDatabase();
      } else {
        this.updateFuzzyRulesMap(this.selectedFuzzyQueryKey);
      }
    },
    async queryDatabase() {
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
        resultEntries = entries;
      } else {
        for (const entry of entries) {
          const fuzzyPron = getFuzzyPronunciation(fuzzyName, entry);
          const matchInitial = !queryInitials || queryInitials.has(fuzzyPron.initial);
          const matchFinal = !queryFinals || queryFinals.has(fuzzyPron.final);
          const matchTone = !queryTones || queryTones.has(fuzzyPron.tone);
          if (matchInitial && matchFinal && matchTone) {
            resultEntries.push(entry);
          }
        }
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
      setUrlQueryParameter("initials", [...queryInitials].sort().join(","));
      setUrlQueryParameter("finals", [...queryFinals].sort().join(","));
      setUrlQueryParameter("tones", [...queryTones].sort().join(","));
    },
    showQueryResultList(resultEntries) {
      this.queryResultEmpty = resultEntries.length === 0;
      // initial+final -> {tone -> [entryIds]}
      resultEntries.sort((a, b) => this.makeCombinationString(a.pron).localeCompare(this.makeCombinationString(b.pron)));
      let queryResult = {};
      let fuzzyName = this.selectedFuzzyQueryKey;
      for (let i = 0; i < resultEntries.length; i++) {
        let entry = resultEntries[i];
        let fuzzy = getFuzzyPronunciation(fuzzyName, entry);
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
      let selectAll = emptyCount === 3;
      return [new Set(selectedInitials), new Set(selectedFinals), new Set(selectedTones), selectAll];
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
    })
        .then(this.initializeAccents)
        .then(this.initialSelectFromGetParameters);
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
