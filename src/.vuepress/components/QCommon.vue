<script setup>
import {h, ref} from 'vue';
</script>

<script>

import {h, ref} from 'vue';
import {withBase} from "vuepress/client";
import VueCookies from 'vue-cookies';

// import sql js
import initSqlJs from "sql.js";
import sqlWasm from "sql.js/dist/sql-wasm.wasm?url";
import jquery from "jquery";
const $ = jquery;
// import 'jquery.cookie';

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

const darkModeString = ref('light');
function updateDarkModeString() {
  darkModeString.value = $("html")?.attr("data-theme") || "light";
}
function initDarkModeString() {
  updateDarkModeString();
  let button = $("#appearance-switch");
  button?.click(updateDarkModeString);
  // for each children check if it has class darkModeString
  // button?.children('svg').each(function() {
  //   let item = $(this);
  //   let isCur = item.hasClass(`${darkModeString.value}-icon`);
  //   if (isCur) {
  //     item.attr('style', 'display:block');
  //   } else {
  //     item.attr('style', 'display:none');
  //   }
  // });
}

const PUJToneMarks = [
  /*0:*/ "",
  /*1:*/ "",
  /*2:*/ "\u0301", // 锐音符 ́
  /*3:*/ "\u0300", // 抑音符 ̀
  /*4:*/ "",
  /*5:*/ "\u0302", // 扬抑符 ̂
  /*6:*/ "\u0303", // 波浪符 ̃
  /*7:*/ "\u0304", // 长音符 ̄
  // /*8:*/ "\u030d", // 竖线符 ̍
  // /*8:*/ "\u0341", // 锐音声调符 ́，外观与 0301 完全相同，这里为了区分于 2 声调方便以后重构
  /*8:*/ "\u0301", // 锐音符 ́
];

const PUJSpecialVowels = {
  "v": "ṳ",
  "V": "Ṳ",
  "r": "o̤",
  "R": "O̤",
};

const VowelOrder = ['A', 'a', 'E', 'e', 'O', 'o', 'I', 'i', 'Y', 'y', 'U', 'u', 'V', 'v', 'R', 'r', PUJSpecialVowels['V'], PUJSpecialVowels['v'], PUJSpecialVowels['R'], PUJSpecialVowels['r']];

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

  getCombination() {
    return this.combination;
  }

  getCombinationDisplay() {
    return addPUJToneMarkAndUnify(this.combination);
  }
}

class Pronunciation {
  constructor(initial, final, tone) {
    this.initial = initial;
    this.final = final;
    this.tone = tone;
    this.combination = initial + final + tone;
  }

  getCombination() {
    return this.initial + this.final + this.tone;
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
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iem';
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
      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  xiqiang: {
    name: '戏腔',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 府城特色高化元音
      result.final = result.final.replace(/^io(nn|h|nnh)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn|h|nnh)*$/, 'iou$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  chaoan: {
    name: '潮安',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 潮安饶平特色 oi -> ue
      if (result.initial.match(/^(p|ph|m|b)$/))
        result.final = result.final.replace(/^oi(nn|h|nnh)*$/, 'ue$1');

      // 府城特色高化元音
      result.final = result.final.replace(/^ia([nt])$/, 'ie$1');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  fengshun: {
    name: '丰顺',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iem';
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

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  raoping: {
    name: '饶平',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === 'uoinn') result.final = 'uinn';

      // 潮安饶平特色 oi -> ue
      if (result.initial.match(/^(p|ph|m|b)$/))
        result.final = result.final.replace(/^oi(nn|h|nnh)*$/, 'ue$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // bu- 阳声韵变为 mu-
      if (result.initial === 'b' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'm';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  chenghai: {
    name: '澄海',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
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
      result.final = result.final.replace(/^([aoveiu]+)m$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)p$/, '$1k');

      // 双唇音接 ng 圆唇化
      if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng')
        result.final = 'ung';
      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  shantou: {
    name: '汕头',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
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
      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  jieyang: {
    name: '揭阳',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // 揭阳特色 ing ik -> eng ek
      result.final = result.final.replace(/^i(ng|k)$/, 'e$1');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  chaoyang: {
    name: '潮阳',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 声调：3 6 混为 3 // 变调目前依然是能区分的，单字调要不要分需要再考虑
      // if (result.tone === '6') result.tone = '3';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  puning: {
    name: '普宁',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  huilai: {
    name: '惠来',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === "r") result.final = 'o';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 声调 3 7 混为 3 // 变调目前依然是能区分的，单字调要不要分需要再考虑
      // if (result.tone === '7') result.tone = '3';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

      return result;
    },
  },
  lufeng: {
    name: '陆丰',
    fuzzy: function (original) {
      let result = new Pronunciation(original.initial, original.final, original.tone);

      // 特殊韵母直接映射
      if (result.final === 'v') result.final = 'u';
      if (result.final === "r") result.final = 'e';
      if (result.final === "rh") result.final = 'oh';
      if (result.final === "rm") result.final = 'iam';
      if (result.final === 'eu') result.final = 'iu';
      if (result.final === 'oinn') result.final = 'ainn';
      if (result.final === 'uoinn') result.final = 'uainn';
      if (result.final === 'ou') result.final = 'au';

      // 陆丰特色 ue -> uei
      result.final = result.final.replace(/^ue(h|nn|nn'h)?$/, 'uei$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 去除所有撇号 '
      result.initial = result.initial.replace("'", '');
      result.final = result.final.replace("nn'", '');

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

function unifyWordDisplay(word, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  word = word.replace(/0/g, '');
  word = word.replace(/v/g, v);
  word = word.replace(/V/g, V);
  word = word.replace(/r/g, r);
  word = word.replace(/R/g, R);
  // word = word.replace(/(o)(\W*)(')/g, `${o2}$2`);
  // word = word.replace(/(O)(\W*)(')/g, `${O2}$2`);
  return word;
}

function addPUJToneMark(sentence) {
  let result = "";
  let cur = "";
  for (let i = 0; i < sentence.length; i++) {
    if (/[a-zA-Z0-9']/.test(sentence[i])) {
      cur += sentence[i];
    } else {
      result += addPUJToneMarkForSingle(cur);
      cur = "";
      result += sentence[i];
    }
  }
  if (cur !== "") {
    result += addPUJToneMarkForSingle(cur);
  }
  // 为了美观轻声调用点表示
  result = result.replace(/--/g, '·');
  return result;
}

/**
 * 为单个字添加音调符号
 */
function addPUJToneMarkForSingle(word, tone) {
  if (tone === 0 || tone === 1 || tone === 4) {
    return word;
  }
  if (tone === undefined) {
    tone = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] >= '1' && word[i] <= '8') {
        tone = parseInt(word[i]);
        word = word.substring(0, i) + word.substring(i + 1);
        break;
      }
    }
  }

  // 添加音调符号：找到开口度最大的元音字母，开口度从大到小顺序为 aeoiuv
  let vowelsIndices = [];
  for (let i = 0; i < word.length; i++) {
    if (VowelOrder.includes(word[i])) {
      vowelsIndices.push(i);
    }
  }
  if (vowelsIndices.length > 1 && "iyuIYU".includes(word[vowelsIndices[0]])) {
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

function addPUJToneMarkAndUnify(sentence) {
  return unifyWordDisplay(addPUJToneMark(sentence)).normalize();
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
      locateFile: () => sqlWasm,
      // locateFile: () => "https://lib.baomitu.com/sql.js/1.9.0/sql-wasm.wasm",
      // locateFile: () => '/data/sql-wasm.wasm',
    };
    const sqlPromise = initSqlJs(config);
    const dataPromise = fetch(withBase('/data/entries.db')).then(response => response.arrayBuffer());
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

function setLocalOption(optionName, optionValue) {
  if (typeof document === 'undefined') return;
  try {
    localStorage.setItem(`pujdict-${optionName}`, optionValue);
    // VueCookies.set(optionName, optionValue, '365d', '/', '', true);
    // $.cookie(optionName, optionValue, {expires: 365, path: "/;SameSite=Lax", secure: true});
  } catch (e) {
    console.error(e);
  }
}

function getLocalOption(optionName, $default = null) {
  if (typeof document === 'undefined') return $default;
  try {
    return localStorage.getItem(`pujdict-${optionName}`) ?? $default;
    // return VueCookies.get(optionName) ?? $default;
    // return $.cookie(optionName);
  } catch (e) {
    console.error(e);
    return $default;
  }
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

function isChineseChar(c) {
  /*
  CJK Unified Ideographs                  4E00-9FFF   Common
  CJK Unified Ideographs Extension A      3400-4DBF   Rare
  CJK Unified Ideographs Extension B      20000-2A6DF Rare, historic
  CJK Unified Ideographs Extension C      2A700–2B73F Rare, historic
  CJK Unified Ideographs Extension D      2B740–2B81F Uncommon, some in current use
  CJK Unified Ideographs Extension E      2B820–2CEAF Rare, historic
  CJK Unified Ideographs Extension F      2CEB0–2EBEF  Rare, historic
  CJK Unified Ideographs Extension G      30000–3134F  Rare, historic
  CJK Unified Ideographs Extension H      31350–323AF Rare, historic
  CJK Compatibility Ideographs            F900-FAFF   Duplicates, unifiable variants, corporate characters
  CJK Compatibility Ideographs Supplement 2F800-2FA1F Unifiable variants
  CJK Radicals / Kangxi Radicals          2F00–2FDF
  CJK Radicals Supplement                 2E80–2EFF
  CJK Symbols and Punctuation             3000–303F
   */
  let charCode = c.charCodeAt(0);
  return (charCode >= 0x4E00 && charCode <= 0x9FFF) ||
      (charCode >= 0x3400 && charCode <= 0x4DBF) ||
      (charCode >= 0x20000 && charCode <= 0x2A6DF) ||
      (charCode >= 0x2A700 && charCode <= 0x2B73F) ||
      (charCode >= 0x2B740 && charCode <= 0x2B81F) ||
      (charCode >= 0x2B820 && charCode <= 0x2CEAF) ||
      (charCode >= 0x2CEB0 && charCode <= 0x2EBEF) ||
      (charCode >= 0x30000 && charCode <= 0x3134F) ||
      (charCode >= 0x31350 && charCode <= 0x323AF) ||
      (charCode >= 0xF900 && charCode <= 0xFAFF) ||
      (charCode >= 0x2F800 && charCode <= 0x2FA1F) ||
      (charCode >= 0x2F00 && charCode <= 0x2FDF) ||
      (charCode >= 0x2E80 && charCode <= 0x2EFF);
}

export {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  // $,
  fuzzyRules, db, entriesCount, initials, finals, combinations,
  darkModeString, initDarkModeString,
  isChineseChar,
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

<style lang="scss">

@import 'bootstrap/scss/bootstrap-utilities';

</style>