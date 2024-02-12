<template>
  <div v-bind:data-bs-theme="$isDarkmode ? 'dark' : 'light'">
    <form id="query-conditions" class="row g-3">
      <div class="mb-auto">
        <div class="form-label"><b>口音偏好</b></div>
        <div id="fuzzy-query" class="query-filter-list">
          <div class="form-check form-check-inline offset-sm-0" id="fuzzy-query-proto">
            <input class="form-check-input" type="radio"/>
            <label class="form-check-label" style="width: 2em"></label>
          </div>
        </div>
      </div>
      <div class="mb-auto">
        <div class="form-label"><b>声母</b></div>
        <div id="initials-list" class="query-filter-list">
          <div class="form-check form-check-inline" id="initials-list-proto">
            <input class="form-check-input" type="checkbox"/>
            <label class="form-check-label" style="width: 2em"></label>
          </div>
        </div>
      </div>
      <div class="mb-auto">
        <div class="form-label"><b>韵母</b></div>
        <div id="finals-list" class="query-filter-list">
          <div class="form-check form-check-inline" id="finals-list-proto">
            <input class="form-check-input" type="checkbox"/>
            <label class="form-check-label" style="width: 2em"></label>
          </div>
        </div>
      </div>
      <div class="mb-auto">
        <div class="form-label"><b>声调</b></div>
        <div id="tones-list" class="query-filter-list">
          <div class="form-check form-check-inline" id="tones-list-proto">
            <input class="form-check-input" type="checkbox"/>
            <label class="form-check-label" style="width: 2em"></label>
          </div>
        </div>
      </div>
      <div class="btn-toolbar">
        <div class="btn-group">
          <input id="query-button" class="btn btn-outline-primary" type="button" value="查询"/>
          <input id="reset-button" class="btn btn-outline-secondary" type="button" value="重置"/>
        </div>
        <img id="loading" src="/loading.svg" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <hr/>
    <div id="query-result"></div>
  </div>
</template>

<script setup>

</script>

<script>
import {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  unifyWordDisplay, addPUJToneMarkForSingle,
  initFromDatabase,
  setLoading, setOptionInCookie, getOptionInCookie, setUrlQueryParameter, resetUrlQueryParameter,
  extractProto,
  // $,
  fuzzyRules, db, entriesCount, initials, finals, combinations
} from './Qcommon.vue';
import jquery from 'jquery';
import 'jquery.cookie';

const $ = jquery;

// import 'bootstrap';
import 'khroma';

export default {
  mounted() {
    import('bootstrap');
    import('khroma');

    var fuzzyName = "dummy";
    // 定义一组模糊音映射，原始拼音 str -> 模糊拼音 Pronunciation，在索引页显示所有映射后的拼音，拼音格式为列表 [initial, final, tone]
    var fuzzyRulesMap = {};
    // 定义一组模糊音映射，模糊拼音 str -> 原始拼音列表 Pronunciation，在点击索引按钮检索时使用，将搜索出所有符合条件的原始拼音
    var fuzzyRulesMapReverse = {};

    // proto of fuzzy div tag, clone it every time when needed
    const fuzzyProto = extractProto("#fuzzy-query-proto");
    const initialsListProto = extractProto("#initials-list-proto");
    const finalsListProto = extractProto("#finals-list-proto");
    const tonesListProto = extractProto("#tones-list-proto");

    function initQuerySelectionArea() {
      // 设置模糊音匹配规则口音
      $("#fuzzy-query").children().not("#fuzzy-query-proto").remove();
      for (let key in fuzzyRules) {
        let rule = fuzzyRules[key];
        let cur = fuzzyProto.clone();
        let input = cur.find("input");
        input.attr("name", "fuzzy-query");
        input.attr("value", key);
        input.attr("id", "fuzzy-query-" + key);
        input.change(onFuzzyRuleSelected);
        let label = cur.find("label");
        label.attr("for", "fuzzy-query-" + key);
        label.text(rule.name);
        $("#fuzzy-query").append(cur);
      }
      // 读取设置 cookie 选择口音
      let fuzzyQuery = getOptionInCookie("fuzzy-query");
      if (fuzzyQuery !== undefined) {
        $("#fuzzy-query-" + fuzzyQuery).attr("checked", "checked");
      } else {
        // 默认选中标准口音 key = 'dummy'
        $("#fuzzy-query-dummy").attr("checked", "checked");
      }

      onFuzzyRuleSelected();
    }

    function onFuzzyRuleSelected() {
      let selected = $("input[name='fuzzy-query']:checked").val();
      fuzzyName = selected;
      let rule = fuzzyRules[selected];
      fuzzyRulesMap = {};
      fuzzyRulesMapReverse = {};
      let fuzzyInitials = new Set();
      let fuzzyFinals = new Set();
      let fuzzyTones = new Set();
      for (let i = 0; i < combinations.length; i++) {
        let combination = combinations[i];
        let fuzzy = rule.fuzzy(combination);
        let fuzzyString = fuzzy.initial + fuzzy.final + fuzzy.tone;
        let originalString = combination.initial + combination.final + combination.tone;
        fuzzyRulesMap[originalString] = fuzzy;
        if (fuzzyRulesMapReverse[fuzzyString] === undefined) {
          fuzzyRulesMapReverse[fuzzyString] = [];
        }
        fuzzyRulesMapReverse[fuzzyString].push(combination);
        fuzzyInitials.add(fuzzy.initial);
        fuzzyFinals.add(fuzzy.final);
        fuzzyTones.add(fuzzy.tone);

        let fuzzyStringWithoutTone = fuzzy.initial + fuzzy.final;
        if (fuzzyRulesMapReverse[fuzzyStringWithoutTone] === undefined) {
          let originalWithoutTone = structuredClone(combination);
          let originalStringWithoutTone = combination.initial + combination.final;
          let fuzzyWithoutTone = structuredClone(fuzzy);
          fuzzyRulesMapReverse[fuzzyStringWithoutTone] = [originalWithoutTone];
          fuzzyWithoutTone.tone = "";
          fuzzyRulesMap[originalStringWithoutTone] = fuzzyWithoutTone;
        }
      }
      makeQueryConditions(Array.from(fuzzyInitials).sort(), Array.from(fuzzyFinals).sort(), Array.from(fuzzyTones).sort());
      // 重新设置选项 cookie
      setOptionInCookie("fuzzy-query", selected);
    }

    function makeQueryConditions(initials, finals, tones) {
      // 设置声母列表
      $("#initials-list").children().not("#initials-list-proto").remove();
      for (let i = 0; i < initials.length; i++) {
        let initial = initials[i];
        let cur = initialsListProto.clone();
        let input = cur.find("input");
        input.attr("value", initial);
        input.attr("id", "initial-" + initial);
        let label = cur.find("label");
        label.attr("for", "initial-" + initial);
        label.text(initial);
        $("#initials-list").append(cur);
      }
      // 设置韵母列表
      $("#finals-list").children().not("#finals-list-proto").remove();
      for (let i = 0; i < finals.length; i++) {
        let final = finals[i];
        let cur = finalsListProto.clone();
        let input = cur.find("input");
        input.attr("value", final);
        input.attr("id", "final-" + final);
        let label = cur.find("label");
        label.attr("for", "final-" + final);
        label.text(unifyWordDisplay(final));
        $("#finals-list").append(cur);
      }
      // 设置声调列表
      $("#tones-list").children().not("#tones-list-proto").remove();
      for (let i = 0; i < tones.length; i++) {
        let tone = tones[i];
        let cur = tonesListProto.clone();
        let input = cur.find("input");
        input.attr("value", tone);
        input.attr("id", "tone-" + tone);
        let label = cur.find("label");
        label.attr("for", "tone-" + tone);
        label.text(tone);
        $("#tones-list").append(cur);
      }
    }

    function getQueryConditionList(selectAllForEmpty) {
      let emptyCount = 0;
      let selectedInitials = Array.from($("#initials-list input:checked")).map((item) => item.value);
      if (selectedInitials.length === 0 && selectAllForEmpty) {
        selectedInitials = Array.from($("#initials-list input")).map((item) => item.value);
        ++emptyCount;
      }
      let selectedFinals = Array.from($("#finals-list input:checked")).map((item) => item.value);
      if (selectedFinals.length === 0 && selectAllForEmpty) {
        selectedFinals = Array.from($("#finals-list input")).map((item) => item.value);
        ++emptyCount;
      }
      let selectedTones = Array.from($("#tones-list input:checked")).map((item) => item.value);
      if (selectedTones.length === 0 && selectAllForEmpty) {
        selectedTones = Array.from($("#tones-list input")).map((item) => item.value);
        ++emptyCount;
      }
      if (emptyCount === 3) {
        return [selectedInitials, selectedFinals, selectedTones, true];
      }
      return [selectedInitials, selectedFinals, selectedTones, false];
    }

    /**
     * components using sqlite
     */
    function querySqlite() {
      if (db === null) {
        alert("数据库尚未加载完成，请稍后再试。");
        return;
      }
      setLoading(true);

      let resultEntries = [];

      setUrlQueryParameterPron(fuzzyName, ...getQueryConditionList(false));
      let [queryInitials, queryFinals, queryTones, queryAll] = getQueryConditionList(true);
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
        let insertTmpTableSqlValues = [];
        let sqlResult = null;
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
                insertTmpTableSqlValues.push("(\"" + curFuzzy.combination + "\")");
              }
              // avoid too many values in one sql
              if (insertTmpTableSqlValues.length > 1000) {
                db.exec(insertTmpTableSql + insertTmpTableSqlValues.join(","));
                insertTmpTableSqlValues = [];
              }
            }
          }
        }
        if (insertTmpTableSqlValues.length > 0) {
          db.exec(insertTmpTableSql + insertTmpTableSqlValues.join(","));
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
      showQueryResultList(resultEntries);
      setLoading(false);
    }

    function showQueryResultList(resultEntries) {
      // initial+final -> {tone -> [entryIds]}
      resultEntries.sort((a, b) => a.combination.localeCompare(b.combination));
      let queryResult = {};
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

      $("#query-result").empty();
      if (queryResult && Object.keys(queryResult).length > 0) {
        // 列出结果列表，格式为
        // 1. initial+final: (tone1) entry1.char, entry2.char, ...; (tone2) entry3.char, entry4.char, ...
        // 2. initial+final: (tone1) entry1.char, entry2.char, ...; (tone2) entry3.char, entry4.char, ...
        let list = $("<ul></ul>");
        for (let key in queryResult) {
          let queryResultItem = queryResult[key];
          for (let tone in queryResultItem) {
            if (queryResultItem[tone].length === 0) {
              delete queryResultItem[tone];
            }
          }
          if (Object.keys(queryResultItem).length === 0) {
            continue;
          }
          let listItem = $("<li></li>");
          let displayKey = unifyWordDisplay(key);
          listItem.text(displayKey + ":");
          for (let tone in queryResultItem) {
            let entryIdsInTone = queryResultItem[tone];
            let toneItem = makeResultTone(tone);
            listItem.append(toneItem);
            for (let j = 0; j < entryIdsInTone.length; j++) {
              let entry = entryIdsInTone[j];
              let entryItem = makeResultChar(entry);
              listItem.append(entryItem);
            }
          }
          list.append(listItem);
        }
        $("#query-result").append(list);
        // fade in the result
        $("#query-result").css({display: "none"});
        $("#query-result").fadeIn(300);
      } else {
        $("#query-result").append("没有找到符合条件的结果。");
      }
    }

    function makeResultTone(tone) {
      const map = "①②③④⑤⑥⑦⑧";
      tone = parseInt(tone);
      if (tone < 1 || tone > 8) {
        return "";
      }
      let toneItem = $("<span></span>");
      toneItem.text(map[tone - 1]);
      toneItem.addClass("tone-number");
      return toneItem;
    }

    function makeResultChar(entry) {
      let entryItem = $("<span></span>");

      let charSimSpan = $("<span></span>");
      charSimSpan.text(entry.char_sim);
      switch (entry.cat) {
        case '0':
          break;
        case '1': // 白读音
          charSimSpan.addClass("char-colloquial");
          break;
        case '2': // 文读音
          charSimSpan.addClass("char-literary");
          break;
        default: // 俗读音
          charSimSpan.addClass("char-conventional");
          break;
      }
      entryItem.append(charSimSpan);

      if (entry.char_sim !== entry.char) {
        let charSpan = $("<span></span>");
        charSpan.text("(" + entry.char + ")");
        charSpan.addClass("char-traditional");
        entryItem.append(charSpan);
      }

      // add url <a> link -> /?chars=entry.char
      let url = "./qchar.html?chars=" + entry.char;
      let charLink = $("<a></a>");
      charLink.attr("href", url);
      charLink.attr("target", "_blank");
      charLink.append(entryItem);
      return charLink;
    }

    function setUrlQueryParameterPron(queryFuzzy, queryInitials, queryFinals, queryTones) {
      setUrlQueryParameter("fuzzy", queryFuzzy);
      setUrlQueryParameter("initials", queryInitials.join(","));
      setUrlQueryParameter("finals", queryFinals.join(","));
      setUrlQueryParameter("tones", queryTones.join(","));
    }

    function resetUrlQueryParameterPron() {
      resetUrlQueryParameter("fuzzy");
      resetUrlQueryParameter("initials");
      resetUrlQueryParameter("finals");
      resetUrlQueryParameter("tones");
    }

    $("#reset-button").click(function () {
      // clear all checked
      $("#initials-list input").prop("checked", false);
      $("#finals-list input").prop("checked", false);
      $("#tones-list input").prop("checked", false);
      resetUrlQueryParameterPron();
      this.blur();
    });

    // async click components button
    $("#query-button").click(function () {
      querySqlite();
      this.blur();
    });
    initFromDatabase().then(initQuerySelectionArea).then(() => {
      setLoading(false);
    }).then(() => {
      // components using url components string
      let searchParams = new URLSearchParams(window.location.search);
      let queryFuzzy = searchParams.get("fuzzy");
      let queryInitials = searchParams.get("initials");
      let queryFinals = searchParams.get("finals");
      let queryTones = searchParams.get("tones");
      // components if any of them is not null
      if (queryInitials !== null || queryFinals !== null || queryTones !== null) {
        if (queryFuzzy !== null) {
          $("#fuzzy-query-" + queryFuzzy).attr("checked", "checked");
        }
        if (queryInitials !== null) {
          queryInitials = queryInitials.split(",");
          for (let i = 0; i < queryInitials.length; i++) {
            $("#initial-" + queryInitials[i]).attr("checked", "checked");
          }
        }
        if (queryFinals !== null) {
          queryFinals = queryFinals.split(",");
          for (let i = 0; i < queryFinals.length; i++) {
            $("#final-" + queryFinals[i]).attr("checked", "checked");
          }
        }
        if (queryTones !== null) {
          queryTones = queryTones.split(",");
          for (let i = 0; i < queryTones.length; i++) {
            $("#tone-" + queryTones[i]).attr("checked", "checked");
          }
        }
        querySqlite();
      }
    });
  }
}
</script>

<style scoped lang="scss">


//@import 'bootstrap/scss/functions';
//@import 'bootstrap/scss/variables';
//@import 'bootstrap/scss/variables-dark';
//@import 'bootstrap/scss/maps';
//@import 'bootstrap/scss/mixins';
//@import 'bootstrap/scss/utilities';
//@import 'bootstrap/scss/root';
//@import 'bootstrap/scss/reboot';
//@import 'bootstrap/scss/type';
////@import 'bootstrap/scss/bootstrap-reboot';
//@import 'bootstrap/scss/bootstrap-utilities';
//@import 'bootstrap/scss/buttons';
//@import 'bootstrap/scss/button-group';
////@import 'bootstrap/scss/input-group';
//@import 'bootstrap/scss/forms';
////@import 'bootstrap/scss/custom-forms';
////@import 'bootstrap/scss/buttons';
//@import 'bootstrap/scss/helpers';
@import 'bootstrap/scss/bootstrap';

</style>

<style lang="scss">
//#query-input {
//  background-color: transparent;
//}
//
//.query-filter-list label {
//  /* add fixed width blank between every label */
//  display: inline-block;
//  width: 80px;
//  height: 120%;
//}
//
.query-filter-list * {
  /* add hover mouse icon */
  cursor: pointer;
}

/* add left margin 4px and right margin 2px */
#query-result .tone-number {
  margin: 0 2px 0 4px;
}
</style>
