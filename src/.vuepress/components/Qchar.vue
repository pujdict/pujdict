<template>
  <div v-bind:data-bs-theme="$isDarkmode ? 'dark' : 'light'">
    <form class="row g-3" onsubmit="return false;">
      <div class="query-input-area">
        <!-- 长度充满整个div -->
        <input class="form-control" id="query-input" type="text" placeholder="输入汉字..." maxlength="256"/>
      </div>

      <div class="btn-toolbar">
        <div class="btn-group">
          <input id="query-button" class="btn btn-outline-primary" type="submit" value="查询"/>
          <input id="reset-button" class="btn btn-outline-secondary" type="button" value="重置"/>
        </div>
        <img id="loading" :src="withBase('/loading.svg')" height="30" width="30" alt="加载中"/>
      </div>
    </form>
    <hr/>
    <div id="query-result">
      <div class="card border-dark mb-3" id="query-result-proto">
<!--        <div class="card-header"></div>&lt;!&ndash;字&ndash;&gt;-->
        <div class="card-body">
          <h4 class="card-title"></h4><!--音-->
          <h5 class="card-subtitle mb-auto text-body-secondary"></h5><!--备用-->
          <p class="card-text"></p><!--义-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {withBase} from "@vuepress/client";
</script>

<script>
import {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
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
    const queryResultProto = extractProto("#query-result-proto");

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
        $("#query-result").children().not("#query-result-proto").remove();
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
          let pronunciationText = addPUJToneMarkAndUnify(pronunciation);
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

    function makeEntryArea(entry) {
      // 每个字的div，外面一个带半透明边框、浅色背景的div，里面一个带字的div，大概这样：
      // +---------------------+
      // | 简（繁）  注音        |
      // |                     |
      // | 释义和词例正文        |
      // +---------------------+
      let entryDiv = queryResultProto.clone();
      let charTextDiv = entryDiv.find(".card-title");
      charTextDiv.text('');
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
        varCharSpan.text(` (${entry.char})`);
        charTextDiv.append(varCharSpan);
      }
      if (entry.char_ref) {
        let refCharSpan = $("<span></span>");
        refCharSpan.text(` [${entry.char_ref}]`);
        charTextDiv.append(refCharSpan);
      }
      let pronunciationDiv = entryDiv.find(".card-subtitle");
      let pronunciationText = addPUJToneMarkAndUnify(entry.initial + entry.final + entry.tone);
      pronunciationDiv.text(pronunciationText);
      // add <a> tag to pronunciation text
      // let pronunciationLink = $("<a></a>");
      // pronunciationLink.attr("href", `/query/query_word.html?chars=${pronunciationText}`);
      let charMeaningDiv = entryDiv.find(".card-text");
      charMeaningDiv.text('');
      // 详细内容利用 # 进行条目分割；每个条目内，% 之前为中文释义，之后为词例（如果有），词例集合以 / 分割，每个词例用 @ 分隔开三部分（如果有）：词例正文、词例注音、词例释义
      let meanings = entry.details.split("#");
      meanings.forEach(meaning => {
        let meaningSplit = meaning.split("%");
        let words;
        if (meaningSplit.length === 1) {
          words = meaningSplit[0].split("/");
        } else if (meaningSplit.length === 2) {
          charMeaningDiv.append(meaningSplit[0]);
          charMeaningDiv.append('：');
          words = meaningSplit[1].split("/");
        }
        for (let i = 0; i < words.length; i++) {
          if (i !== 0) {
            charMeaningDiv.append("；");
          }
          charMeaningDiv.append(makeMeaningWord(words[i]));
        }
      });

      return entryDiv;
    }
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>