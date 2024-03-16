<script>
import {
  Entry, Pronunciation,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
} from './QCommon.vue';

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

/*
lang def:
  word ::= (initial) final (tone)
  initial ::= "p" | "ph" | "m" | "b" | "t" | "th" | "n" | "l" | "k" | "kh" | "ng" | "g" | "h" | "ts" | "tsh" | "s" | "j" | "0"
  final ::= (medial) nucleus (coda)
  medial ::= "i" | "u"
  nucleus ::= "a" | "e" | "o" | "i" | "u" | "v" | "r" | "m" | "ng"
  coda ::= "u" | "i" | "m" | "n" | "ng" | "nn" | "p" | "t" | "k" | "h" | "nnh"
*/
const regexpWord = /^(?<initial>p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|tsh|s|j|0)?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiuvr]))?(?<nucleus>a|e|o|i|u|v|r|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*)(?<tone>\d)?)$/i;

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

function convertPUJToDisplaySentence(sentence, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  sentence = sentence.replace(/0/g, '');
  // sentence = sentence.replace(/nn(\W)/g, 'ⁿ$1');
  sentence = sentence.replace(/v(?![uU])/g, v);
  sentence = sentence.replace(/V(?![uU])/g, V);
  sentence = sentence.replace(new RegExp(`(?<![eiyuEIYU][${PUJToneMarks.join('')}]?)r`, 'g'), r);
  sentence = sentence.replace(new RegExp(`(?<![eiyuEIYU][${PUJToneMarks.join('')}]?)R`, 'g'), R);
  // sentence = sentence.replace(/(o)(\W*)(')/g, `${o2}$2`);
  // sentence = sentence.replace(/(O)(\W*)(')/g, `${O2}$2`);
  return sentence;
}

function convertPUJFromDisplaySentence(sentence, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  // sentence = sentence.replace(/ⁿ/g, 'nn');
  sentence = sentence.replace(new RegExp(v, 'g'), 'v');
  sentence = sentence.replace(new RegExp(V, 'g'), 'V');
  sentence = sentence.replace(new RegExp(r, 'g'), 'r');
  sentence = sentence.replace(new RegExp(R, 'g'), 'R');
  return sentence;
}

function forEachWordInSentence(sentence, funcWord, funcNonWord) {
  let cur = "";
  sentence = sentence.normalize('NFD');
  const regexp = new RegExp(`[a-zA-Z0-9']|${Array.from(Object.values(PUJSpecialVowels)).join('|')}|${PUJToneMarks.filter(e => e.length).join('|')}`);
  for (let i = 0; i < sentence.length; i++) {
    if (regexp.test(sentence[i])) {
      cur += sentence[i];
    } else {
      if (cur !== "") {
        funcWord?.(cur);
        cur = "";
      }
      funcNonWord?.(sentence[i]);
    }
  }
  if (cur !== "") {
    funcWord?.(cur);
  }
}

function addPUJToneMarkSentence(sentence) {
  let result = "";
  forEachWordInSentence(sentence,
      (cur) => {
        result += addPUJToneMarkWord(cur);
      },
      (cur) => {
        result += cur;
      });
  // 为了美观轻声调用点表示
  result = result.replace(/(?<=\w)--(?=\w)/g, '·');
  return result;
}

/**
 * 为单个字添加音调符号
 */
function addPUJToneMarkWord(word, tone) {
  if (tone === 0 || tone === 1 || tone === 4) {
    return word;
  }
  if (tone === undefined) {
    tone = 0;
    for (let i = word.length - 1; i >= 0; --i) {
      if (word[i] >= '1' && word[i] <= '8') {
        tone = parseInt(word[i]);
        word = word.substring(0, i) + word.substring(i + 1);
        break;
      }
    }
  }
  const match = word.match(regexpWord);
  if (match) {
    let initial = match.groups.initial ?? '0';
    let medial = match.groups.medial ?? '';
    let nucleus = match.groups.nucleus ?? '';
    let coda = match.groups.coda ?? '';
    if (nucleus !== '') {
      if (nucleus.length === 1) nucleus += PUJToneMarks[tone];
      else if (nucleus.length === 2) nucleus = nucleus[0] + PUJToneMarks[tone] + nucleus[1];
      else nucleus = nucleus[0] + PUJToneMarks[tone] + nucleus.substring(1);
    }
    return initial + medial + nucleus + coda;
  } else {
    console.log(`Error addPUJToneMarkWord: ${word} ${tone}`)
    return '';
  }
}

function undoAddPUJToneMarkWord(word) {
  let initial = '0';
  let final = '';
  let tone = 0;
  if (!word.length) return new Pronunciation(initial, final, tone);

  if (word[word.length - 1].match(/\d/)) {
    tone = parseInt(word[word.length - 1]);
    word = word.substring(0, word.length - 1);
  } else {
    PUJToneMarks.forEach((toneMark, index) => {
      if (toneMark === '' || tone) return;
      if (word.includes(toneMark)) {
        word = word.replace(toneMark, '');
        tone = index;
      }
    });
    if (!tone) {
      // 1 声或 4 声？
      if ('ptkhPTKH'.includes(word[word.length - 1])) {
        tone = 4;
      } else {
        tone = 1;
      }
    }
    if (tone === 2) {
      if ('ptkhPTKH'.includes(word[word.length - 1])) {
        tone = 8;
      }
    }
  }
  const match = word.match(regexpWord);
  if (match) {
    if (match.groups.initial) {
      initial = match.groups.initial;
    }
    if (match.groups.final) {
      final = match.groups.final;
    }
  }

  return new Pronunciation(initial, final, tone);
}

function addPUJToneMarkAndConvertToDisplaySentence(sentence) {
  return convertPUJToDisplaySentence(addPUJToneMarkSentence(sentence));
}

function convertPUJToPronunciationWord(word) {
  word = convertPUJFromDisplaySentence(word);
  let pronunciation = undoAddPUJToneMarkWord(word);
  return pronunciation;
}

function makePUJPronunciationsFromDisplaySentence(pujDisplaySentence, funcWord = convertPUJToPronunciationWord, funcNonWord = null) {
  // 如果有组合的符号，先解离开来
  pujDisplaySentence = pujDisplaySentence.normalize('NFD');
  // 特殊韵母替换
  pujDisplaySentence = pujDisplaySentence.replace(new RegExp(`[${Array.from(Object.values(PUJSpecialVowels)).join('')}]`, 'g'), (match) => {
    for (let key in PUJSpecialVowels) {
      if (PUJSpecialVowels[key] === match) {
        return key;
      }
    }
    return match;
  });
  let result = [];
  forEachWordInSentence(pujDisplaySentence, funcWord, funcNonWord);
  return result;
}

function convertPronunciationToDP(pronunciation) {
  let result = new Pronunciation(pronunciation.initial, pronunciation.final, pronunciation.tone);

  const initialMap = {
    '': '',
    '0': '0',
    'p': 'b',
    'ph': 'p',
    'm': 'm',
    'b': 'bh',
    't': 'd',
    'th': 't',
    'n': 'n',
    'l': 'l',
    'k': 'g',
    'kh': 'k',
    'ng': 'ng',
    'g': 'gh',
    'h': 'h',
    'ts': 'z',
    'tsh': 'c',
    's': 's',
    'j': 'r',
  };

  result.initial = initialMap[result.initial] ?? result.initial;

  // 特殊韵母
  result.final = result.final.replace('e', 'ê');
  result.final = result.final.replace(/v|ir|ur/, 'e');
  result.final = result.final.replace('r', 'er');
  result.final = result.final.replace('iau', 'iou');
  result.final = result.final.replace('au', 'ao');
  // 鼻化韵尾
  result.final = result.final.replace('nn', 'ⁿ');
  // 入声韵尾
  result.final = result.final.replace(/p$/, 'b');
  result.final = result.final.replace(/t$/, 'd');
  result.final = result.final.replace(/k$/, 'g');

  // (v)ng -> eng
  if (result.initial !== '' && result.initial !== 'h' && result.final.match(/^ng$/i)) {
    result.final = 'eng';
  }

  return new Pronunciation(result.initial, result.final, result.tone);
}

function convertPUJToDPSentence(sentence) {
  let result = '';
  forEachWordInSentence(sentence, (cur) => {
    cur = cur.toLowerCase(); // 潮拼的作用只限于标记拼音，一般不用于作为拉丁语形式书写。
    let pronunciation = convertPUJToPronunciationWord(cur);
    if (pronunciation) {
      pronunciation = convertPronunciationToDP(pronunciation);
      pronunciation.initial = pronunciation.initial === '0' ? '' : pronunciation.initial;
      result += pronunciation.initial + pronunciation.final + pronunciation.tone;
    }
  }, (cur) => {
    result += cur;
  })
  return result;
}

export {
  fuzzyRules,
  convertPUJToDisplaySentence,
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplaySentence,
  convertPUJToDPSentence
}

export default {}
</script>