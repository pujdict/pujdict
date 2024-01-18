<template>
<form class="row g-3">
  <div class="query-input-area">
    <!-- 长度充满整个div -->
    <input class="form-control" id="query-input" type="text" placeholder="输入汉字..." maxlength="256" style="background: transparent" />
  </div>

  <div class="btn-toolbar">
    <div class="btn-group">
      <input id="query-button" class="btn btn-outline-primary" type="button" value="查询" />
      <input id="reset-button" class="btn btn-outline-secondary" type="button" value="重置" />
    </div>
    <img id="loading" src="/loading.svg" height="30" width="30" alt="加载中" />
  </div>
</form>
  <div id="query-result"></div>
</template>

<script>
import {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  unifyWordDisplay, addPUJToneMarkForSingle,
  initFromDatabase,
  setLoading, setOptionInCookie, getOptionInCookie, setUrlQueryParameter, resetUrlQueryParameter,
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

    initFromDatabase().then(() => {
      setLoading(false);
      // get the GET parameter in url
      let searchParams = new URLSearchParams(window.location.search);
      let query = searchParams.get("chars");
      if (query !== null) {
        $("#query-input").val(query);
        $("#query-button").click();
      }
    });

    $("#reset-button").click(function () {
      $("#query-input").val("");
      resetUrlQueryParameter("chars");
      this.blur();
    });

    $("#query-button").click(function () {
      let chars = [...$("#query-input").val()];
      // remove all non-Chinese characters
      // query = query.replace(/[^\u4e00-\u9fa5]/g, "");
      if (chars.length !== 0) {
        setLoading(true);
        let entries = queryChars(chars);
        $("#query-result").empty();
        entries.forEach(entry => {
          $("#query-result").append(makeEntryArea(entry));
        });
        setLoading(false);
        setUrlQueryParameter("chars", chars);
      }
      this.blur();
    });

    function queryChars(chars) {
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
      let entries = queryResult[0].values.map(row => new Entry(...row));
      return entries;
    }

    function makeEntryArea(entry) {
      // 每个字的div，外面一个带半透明边框、浅色背景的div，里面一个带字的div，大概这样：
      // +---------------------+
      // | 简（繁）  注音        |
      // |                     |
      // | 释义和词例正文        |
      // +---------------------+
      let entryDiv = $("<div></div>");
      entryDiv.css({
        "border-style": "solid",
        "border-width": "2px",
        "border-radius": "3px",
        "border-color": "var(--md-accent-fg-color)",
        "margin": "5px 0 5px 0",
        "padding": "3px",
        "display": "flex",
        "font-size": "1.5em",
      });
      let charTextDiv = $("<div></div>");
      charTextDiv.css({
        "text-align": "left",
      });
      let mainCharSpan = $("<span></span>");
      mainCharSpan.text(entry.char_sim);
      switch (entry.cat) {
        case '0':
          break;
        case '1': // 白读音
          mainCharSpan.addClass("char-colloquial");
          break;
        case '2': // 文读音
          mainCharSpan.addClass("char-literary");
          break;
        default: // 俗读音
          mainCharSpan.addClass("char-conventional");
          break;
      }
      charTextDiv.append(mainCharSpan);
      if (entry.char !== entry.char_sim) {
        let varCharSpan = $("<span></span>");
        varCharSpan.text(`（${entry.char}）`);
        charTextDiv.append(varCharSpan);
      }
      let pronunciationDiv = $("<div></div>");
      let pronunciationText = unifyWordDisplay(entry.initial + addPUJToneMarkForSingle(entry.final, entry.tone));
      pronunciationDiv.text(pronunciationText);
      // add <a> tag to pronunciation text
      // let pronunciationLink = $("<a></a>");
      // pronunciationLink.attr("href", `/query/query_word.html?chars=${pronunciationText}`);
      charTextDiv.append(pronunciationDiv);
      entryDiv.append(charTextDiv);
      entryDiv.append(pronunciationDiv);
      let charMeaningDiv = $("<div></div>");
      charMeaningDiv.css({
        "font-size": "1.2em",
        "text-align": "center",
      });
      charMeaningDiv.text(entry.meaning);
      entryDiv.append(charMeaningDiv);
      return entryDiv;
    }
  }
}
</script>

<style scoped>
@import "bootstrap";
</style>