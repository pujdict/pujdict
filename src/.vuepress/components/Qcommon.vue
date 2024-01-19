<script setup>
import {h, ref} from 'vue';
</script>

<script>

import {h, ref} from 'vue';

// import sql js
import initSqlJs from "sql.js";
import jquery from "jquery";
const $ = jquery;
import 'jquery.cookie';

// var jsdom = require('jsdom');
// var $ = require('jquery')(jsdom().defaultView);
// const $ = require('jquery');
// import jquery from 'jquery';
// const $ = jquery;
// import { JSDOM } from 'jsdom';
// import jquery from 'jquery';
//
// const jsdom = new JSDOM();
// const $ = jquery(jsdom.window);

const PUJToneMarks = [
  /*0:*/ "",
  /*1:*/ "",
  /*2:*/ "\u0301", // 锐音符 ́
  /*3:*/ "\u0300", // 抑音符 ̀
  /*4:*/ "",
  /*5:*/ "\u0302", // 扬抑符 ̂
  /*6:*/ "\u0303", // 波浪符 ̃
  /*7:*/ "\u0304", // 长音符 ̄
  /*8:*/ "\u030d", // 竖线符 ̍
];

class Entry {
  constructor(entry_index, char, char_sim, initial, final, tone, cat, char_ref, details) {
    this.entry_index = entry_index;
    this.char = char;
    this.char_sim = char_sim;
    this.initial = initial;
    this.final = final;
    this.combination = initial + final + tone;
    this.tone = tone;
    this.cat = cat;
    this.char_ref = char_ref;
    this.details = details;
  }
}

class Pronunciation {
  constructor(initial, final, tone) {
    this.initial = initial;
    this.final = final;
    this.tone = tone;
    this.combination = initial + final + tone;
  }
}

// 模糊音规则
const fuzzyRules = {
  dummy: {
    name: '标准',
    fuzzy: function (original) {
      return original;
    },
  },
  chaozhou: {
    name: '潮州',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 府城特色高化元音
      result.final = result.final.replace(/^io(nn|h|nnh)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'ieu$1');
      result.final = result.final.replace(/^([iu])a([nt])$/, '$1e$2');
      result.final = result.final.replace(/^ia([mp])$/, 'ie$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 双唇音接 ng 圆唇化
      if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng')
        result.final = 'ung';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  xiqiang: {
    name: '戏腔',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 府城特色高化元音
      result.final = result.final.replace(/^io(nn|h|nnh)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'iou$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  chaoan: {
    name: '潮安',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'uoinn') result.final = 'uinn';

      // 潮安饶平特色 oi -> ue
      if (result.initial.match(/^(p|ph|m|b)$/))
        result.final = result.final.replace(/^oi([nn|h|nnh])*$/, 'ue$1');

      // 府城特色高化元音
      result.final = result.final.replace(/^ia([nt])$/, 'ie$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 双唇音接 ng 圆唇化
      if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng')
        result.final = 'ung';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  fengshun: {
    name: '丰顺',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 府城特色高化元音
      result.final = result.final.replace(/^io(nn|h|nnh)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'ieu$1');
      result.final = result.final.replace(/^([iu])a([nt])$/, '$1e$2');
      result.final = result.final.replace(/^ia([mp])$/, 'ie$1');

      // 丰顺特色 en et 韵尾
      if (result.final === 'eng') result.final = 'en';
      if (result.final === 'ek') result.final = 'et';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  raoping: {
    name: '饶平',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'uoinn') result.final = 'uinn';

      // 潮安饶平特色 oi -> ue
      if (result.initial.match(/^(p|ph|m|b)$/))
        result.final = result.final.replace(/^oi([nn|h|nnh])*$/, 'ue$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // bu- 阳声韵变为 mu-
      if (result.initial === 'b' && result.final.match(/^u\w*[m|n|ng]$/))
        result.initial = 'm';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  chenghai: {
    name: '澄海',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // ueng -> 零声母eng / 非零声母uang, uek -> uak
      if (result.final === 'ueng')
        result.final = result.initial === '0' ? 'eng' : 'uang';
      if (result.final === 'uek')
        result.final = 'uak';

      // 府城特色高化元音
      result.final = result.final.replace(/^io(nn|h|nnh)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'iou$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 丢失 mp 韵尾
      result.final = result.final.replace(/^([aoveiu])m$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu])p$/, '$1k');

      // 双唇音接 ng 圆唇化
      if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng')
        result.final = 'ung';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  shantou: {
    name: '汕头',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // ueng -> 零声母eng / 非零声母uang, uek -> uak
      if (result.final === 'ueng')
        result.final = result.initial === '0' ? 'eng' : 'uang';
      if (result.final === 'uek')
        result.final = 'uak';

      // 府城特色高化元音
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'iou$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 双唇音接 ng 圆唇化
      if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng')
        result.final = 'ung';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  jieyang: {
    name: '揭阳',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 揭阳特色 ing ik -> eng ek
      result.final = result.final.replace(/^i([ng|k])$/, 'e$1');

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  chaoyang: {
    name: '潮阳',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 声调：3 6 混为 3
      if (result.tone === '6') result.tone = '3';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  puning: {
    name: '普宁',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  huilai: {
    name: '惠来',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 声调 3 7 混为 3
      if (result.tone === '7') result.tone = '3';

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
  lufeng: {
    name: '陆丰',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 陆丰特色 ue -> uei
      result.final = result.final.replace(/^ue([nn|h|nnh])$/, 'uei$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 去除所有撇号 '
      result.initial = result.initial.replace(/'/g, '');
      result.final = result.final.replace(/'/g, '');

      return result;
    },
  },
};

function makeEntryFromJson(json) {
  let entry = new Entry(
      json.entry_index,
      json.char,
      json.char_sim,
      json.initial,
      json.final,
      json.tone,
      json.cat
  );
  return entry;
}

function makeEntryFromSqlResult(sqlResult) {
  let entry = new Entry(
      sqlResult[0],
      sqlResult[1],
      sqlResult[2],
      sqlResult[3],
      sqlResult[4],
      sqlResult[5],
      sqlResult[6]
  );
  return entry;
}

function unifyWordDisplay(word, v = "ṳ", V = "Ṳ", o2 = "o̤", O2 = "O̤") {
  word = word.replace('0', '');
  word = word.replace('v', v);
  word = word.replace('V', V);
  word = word.replace('o\'', o2);
  word = word.replace('O\'', O2);
  return word;
}

/**
 * 为单个字添加音调符号
 */
function addPUJToneMarkForSingle(word, tone) {
  if (tone === 0 || tone === 1 || tone === 4) {
    return word;
  }

  const VowelOrder = "aeoiuvAEOIUV";
  // 添加音调符号：找到开口度最大的元音字母，开口度从大到小顺序为 aeoiuv
  let vowelsIndices = [];
  for (let i = 0; i < word.length; i++) {
    if (VowelOrder.includes(word[i])) {
      vowelsIndices.push(i);
    }
  }
  if (vowelsIndices.length > 1 && "iuIU".includes(word[vowelsIndices[0]])) {
    // 多于一个且第一个是 iu 的话，iu 就是介音，直接去掉。
    vowelsIndices.shift();
  }
  if (vowelsIndices.length === 0) {
    // 处理特殊鼻声韵母 n m ng：找到倒数第一个 n 或 m，如 园 h[n]g，黄 [n]g，门 m[n]g，村 tsh[n]g，姆 [m]
    for (let i = word.length - 1; i >= 0; i--) {
      if ("nmNM".includes(word[i])) {
        vowelsIndices.push(i);
        break;
      }
    }
  }
  if (vowelsIndices.length === 0) {
    return word;
  }
  if (vowelsIndices.length > 1) {
    // 如果有多个元音，按照开口度排序
    vowelsIndices.sort((a, b) => VowelOrder.indexOf(word[a]) - VowelOrder.indexOf(word[b]));
  }

  let result = "";
  for (let i = 0; i < word.length; i++) {
    result += word[i];
    if (i === vowelsIndices[0]) {
      result += PUJToneMarks[tone];
    }
  }
  return result;
}

// 改用 sql.js 读取数据库
var db = null;
var entriesCount = 0;
var initials = [];
var finals = [];
var combinations = [];

async function initFromDatabase() {
  async function load() {
    // Load sql.js WebAssembly file
    let config = {
      locateFile: () => "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/sql-wasm.wasm",
      // locateFile: () => '/data/sql-wasm.wasm',
    };
    const sqlPromise = initSqlJs(config);
    const dataPromise = fetch('/data/entries.db').then(response => response.arrayBuffer());
    const [sql, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new sql.Database(new Uint8Array(buf));
    // read basic desc data from dbdesc table
    entriesCount = db.exec("SELECT description FROM dbdesc WHERE id='entries_count'")[0].values[0][0];
    initials = db.exec("SELECT description FROM dbdesc WHERE id='initials'")[0].values[0][0].split(",");
    finals = db.exec("SELECT description FROM dbdesc WHERE id='finals'")[0].values[0][0].split(",");
    // combinations are initial-final-tone connected by '-' and separated by ','
    combinations = db.exec("SELECT description FROM dbdesc WHERE id='combinations'")[0].values[0][0].split(",").map(combination =>
        new Pronunciation(...combination.split("-")));
  }

  await load();
}

// var initFromDatabasePromise = initFromDatabase();

function setLoading(loading) {
  if (loading) {
    $("#loading")?.css({display: "block"});
    $("#components-button")?.attr("disabled", "disabled");
    $("#reset-button")?.attr("disabled", "disabled");
  } else {
    $("#loading")?.fadeOut(500);
    $("#components-button")?.removeAttr("disabled");
    $("#reset-button")?.removeAttr("disabled");
  }
}

function setOptionInCookie(optionName, optionValue) {
  $.cookie(optionName, optionValue, {expires: 365, path: "/;SameSite=Lax", secure: true});
}

function getOptionInCookie(optionName) {
  return $.cookie(optionName);
}

function setUrlQueryParameter(key, value) {
  let url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

function resetUrlQueryParameter(key) {
  let url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url);
}

export {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  unifyWordDisplay, addPUJToneMarkForSingle,
  initFromDatabase,
  setLoading, setOptionInCookie, getOptionInCookie, setUrlQueryParameter, resetUrlQueryParameter,
  // $,
  fuzzyRules, db, entriesCount, initials, finals, combinations,
}

const LoadingIcon = {
  render() {
    // img loading.svg
    return h('img', {
      id: 'loading',
      src: '/loading.svg',
      height: '30',
      width: '30',
    });
  },
};

export {
  LoadingIcon,
}

</script>

<template>

</template>

<style scoped lang="scss">

@import 'bootstrap';

</style>