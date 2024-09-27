import {getLocalOption} from "./SUtils.js";
import {Pronunciation} from "./SCommon.js";
import {XSAMPAList, XSAMPAToIPAMap} from "./SXSampaIpa.js";

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

function getPUJToneMark(tone) {
  if (tone <= 0 || tone > 8 || typeof tone !== 'number') {
    return '';
  }
  PUJToneMarks[6] = getLocalOption('custom-tone-mark-6', PUJToneMarks[6]);
  PUJToneMarks[8] = getLocalOption('custom-tone-mark-8', PUJToneMarks[8]);
  return PUJToneMarks[tone];
}

function getPUJToneMarks() {
  PUJToneMarks[6] = getLocalOption('custom-tone-mark-6', PUJToneMarks[6]);
  PUJToneMarks[8] = getLocalOption('custom-tone-mark-8', PUJToneMarks[8]);
  return PUJToneMarks;
}

/**
 * 这个函数照顾到 6、8 两个声调自定义的情况，也照顾到形状相同但 Unicode 编码有不同的情况（例如第二声的锐音符，Unicode 中有 U+0301 U+0341 两个外观基本相同的符号）
 */
function getToneFromPUJDisplay(word) {
  let tone = 0;
  let toneMark = '';
  if (word[word.length - 1].match(/\d/)) {
    tone = parseInt(word[word.length - 1]);
  } else {
    const possibleToneMarks = {
      2: ["\u0301", "\u0341"],
      3: ["\u0300", "\u0340"],
      5: ["\u0302"],
      6: ["\u0303", "\u0342", "\u030C", "\u0306"],
      7: ["\u0304"],
      8: ["\u0301", "\u0341", "\u0302", "\u030D"],
    }
    for (const curTone in possibleToneMarks) {
      for (const possibleToneMark in possibleToneMarks[curTone]) {
        if (word.includes(possibleToneMark)) {
          tone = curTone;
          toneMark = possibleToneMark;
          break;
        }
      }
      if (tone) break;
    }
    // 入声做一次额外处理：4 声无调符，8 声的调符可能与 2 声或 5 声相同。
    // 这里简化了判断的依据。如果是入声韵并且有声调符号，那么就认为是 8 声。
    // 如果是入声韵并且前面没发现调符，就是 4 声。
    if ('ptkhPTKH'.includes(word[word.length - 1])) {
      tone = tone ? 8 : 4;
    }
  }
  return [tone, toneMark];
}

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
const regexpWord = /^(?<initial>p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0)?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiu]))?(?<nucleus>a|e|o|i|u|v|ur|ir|r|er|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*)(?<tone>\d)?)$/i;

// 模糊音规则
const fuzzyRules = {
  dummy: {
    name: '辞典',
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
      result.final = result.final.replace(/^io(nn'?|h|nn'?h)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'ieu$1');
      result.final = result.final.replace(/^([iu])a([nt])$/, '$1e$2');
      result.final = result.final.replace(/^ia([mp])$/, 'ie$1');

      // 府城特色 m 阳声韵前 n -> l
      if (result.final.endsWith('m') && result.initial === 'n')
        result.initial = 'l';

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

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
      result.final = result.final.replace("nn'", 'nn');

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
      result.final = result.final.replace(/^io(nn'?|h|nn'?h)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'iou$1');

      // 府城特色 m 阳声韵前 n -> l
      if (result.final.endsWith('m') && result.initial === 'n')
        result.initial = 'l';

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

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
      result.final = result.final.replace("nn'", 'nn');

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
        result.final = result.final.replace(/^oi(nn|h|nnh)*/, 'ue$1');

      // 府城特色高化元音
      result.final = result.final.replace(/^ia([nt])$/, 'ie$1');

      // 府城特色 m 阳声韵前 n -> l
      if (result.final.endsWith('m') && result.initial === 'n')
        result.initial = 'l';

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 齿龈音接 iong iok 丢失介音
      if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong')
        result.final = 'ong';
      if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok')
        result.final = 'ok';

      // 去除所有撇号 '
      result.final = result.final.replace("nn'", 'nn');

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
      result.final = result.final.replace(/^io(nn'?|h|nn'?h)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'ieu$1');
      result.final = result.final.replace(/^([iu])a([nt])$/, '$1e$2');
      result.final = result.final.replace(/^ia([mp])$/, 'ie$1');

      // 府城特色 m 阳声韵前 n -> l
      if (result.final.endsWith('m') && result.initial === 'n')
        result.initial = 'l';

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

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
      result.final = result.final.replace("nn'", 'nn');

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
        result.final = result.final.replace(/^oi(nn|h|nnh)*/, 'ue$1');

      // 府城特色 m 阳声韵前 n -> l
      if (result.final.endsWith('m') && result.initial === 'n')
        result.initial = 'l';

      // bu- 阳声韵变为 mu-
      if (result.initial === 'b' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'm';

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
      result.final = result.final.replace("nn'", 'nn');

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
      result.final = result.final.replace(/^io(nn'?|h|nn'?h)*$/, 'ie$1');
      result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'iou$1');

      // 澄海特色 m 阳声韵前 l -> n，这一步骤发生在 m 韵尾丢失之前
      if (result.final.endsWith('m') && result.initial === 'l')
        result.initial = 'n';

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

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
      result.final = result.final.replace("nn'", 'nn');

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
      result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'iou$1');

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

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
      result.final = result.final.replace("nn'", 'nn');

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

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

      // 揭阳特色 in it vn vt -> eng ek
      result.final = result.final.replace(/^[iv]([nt])$/, 'e$1');

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
      result.final = result.final.replace("nn'", 'nn');

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

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

      // 西部地区特色 vn vt -> ing ik
      result.final = result.final.replace(/^v([nt])$/, 'i$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 声调：3 6 混为 3 // 变调目前依然是能区分的，单字调要不要分需要再考虑
      // if (result.tone === '6') result.tone = '3';

      // 去除所有撇号 '
      result.final = result.final.replace("nn'", 'nn');

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

      // 西部地区特色 vn vt -> ing ik
      result.final = result.final.replace(/^v([nt])$/, 'i$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 去除所有撇号 '
      result.final = result.final.replace("nn'", 'nn');

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

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

      // 西部地区特色 vn vt -> ing ik
      result.final = result.final.replace(/^v([nt])$/, 'i$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 声调 3 7 混为 3 // 变调目前依然是能区分的，单字调要不要分需要再考虑
      // if (result.tone === '7') result.tone = '3';

      // 去除所有撇号 '
      result.final = result.final.replace("nn'", 'nn');

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
      if (result.final.startsWith('ou')) result.final = result.final.replace('ou', 'au');

      // mu- 阳声韵变为 bu-
      if (result.initial === 'm' && result.final.match(/^u\w*(m|n|ng)$/))
        result.initial = 'b';

      // 陆丰特色 ue -> uei
      result.final = result.final.replace(/^ue(h|nn|nn'h)?$/, 'uei$1');

      // 丢失 nt 韵尾
      result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
      result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');

      // ng 增生 v 元音
      if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0')
        result.final = 'vng';

      // 去除所有撇号 '
      result.final = result.final.replace("nn'", 'nn');

      return result;
    },
  },
  custom: {
    name: '自定',
    fuzzy: function (original) {
      const customFuzzyQueryRule = getLocalOption('custom-puj-fuzzy-rule');
      if (customFuzzyQueryRule !== this._fuzzy_str) {
        this._fuzzy_str = customFuzzyQueryRule;
        try {
          this._fuzzy_function = eval(customFuzzyQueryRule);
        } catch (e) {
          console.error(e);
          this._fuzzy_function = null;
        }
      }
      if (typeof this._fuzzy_function === 'function') {
        try {
          return this._fuzzy_function(new Pronunciation(original.initial, original.final, original.tone));
        } catch (e) {
          console.error(e);
        }
      }
      return original;
    },
    _fuzzy_function: null,
    _fuzzy_str: null,
  },
};

function convertPlainPUJSentenceToDisplayPUJSentence(sentence, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  sentence = sentence.replace(/0/g, '');
  // sentence = sentence.replace(/nn(\W)/g, 'ⁿ$1');
  sentence = sentence.replace(/v(?![uU])/g, v);
  sentence = sentence.replace(/V(?![uU])/g, V);
  sentence = sentence.replace(new RegExp(`(?<![eiyuEIYU][${getPUJToneMarks().join('')}]?)r`, 'g'), r);
  sentence = sentence.replace(new RegExp(`(?<![eiyuEIYU][${getPUJToneMarks().join('')}]?)R`, 'g'), R);
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
  const regexp = new RegExp(`[a-zA-Z0-9']|${Array.from(Object.values(PUJSpecialVowels)).join('|')}|${getPUJToneMarks().filter(e => e.length).join('|')}`);
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
  result = result.replace(/(?<=\S)--(?=\S)/g, '·');
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
      if (nucleus.length === 1) nucleus += getPUJToneMark(tone);
      else if (nucleus.length === 2) nucleus = nucleus[0] + getPUJToneMark(tone) + nucleus[1];
      else nucleus = nucleus[0] + getPUJToneMark(tone) + nucleus.substring(1);
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
    let toneMark;
    [tone, toneMark] = getToneFromPUJDisplay(word);
    if (toneMark) {
      word = word.replace(toneMark, '');
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

function addPUJToneMarkAndConvertToDisplayPUJSentence(sentence) {
  return convertPlainPUJSentenceToDisplayPUJSentence(addPUJToneMarkSentence(sentence));
}

function convertPlainPUJToPronunciationWord(word) {
  word = convertPUJFromDisplaySentence(word);
  let pronunciation = undoAddPUJToneMarkWord(word);
  return pronunciation;
}

function makePUJPronunciationsFromDisplaySentence(pujDisplaySentence, funcWord = convertPlainPUJToPronunciationWord, funcNonWord = null) {
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

function convertPUJPronunciationToDPPronunciation(pronunciation) {
  let result = new Pronunciation(pronunciation.initial, pronunciation.final, pronunciation.tone);

  const initialMap = {
    '': '',
    '0': '',
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
  result.final = result.final.replace(/r|er/, 'er');
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

  // 去掉 nn'
  if (result.final.endsWith("'")) result.final = result.final.substring(0, result.final.length - 1);
  return new Pronunciation(result.initial, result.final, result.tone);
}

function convertPUJToDPSentence(sentence) {
  let result = '';
  forEachWordInSentence(sentence, (cur) => {
    cur = cur.toLowerCase(); // 潮拼的作用只限于标记拼音，一般不用于作为拉丁语形式书写。
    let pronunciation = convertPlainPUJToPronunciationWord(cur);
    if (pronunciation) {
      pronunciation = convertPUJPronunciationToDPPronunciation(pronunciation);
      pronunciation.initial = pronunciation.initial === '0' ? '' : pronunciation.initial;
      result += pronunciation.initial + pronunciation.final + pronunciation.tone;
    }
  }, (cur) => {
    result += cur;
  })
  return result;
}

function convertPUJPronunciationToFanQiePronunciation(pronunciation, fallback_pronunciation = null) {
  const initial_map = {
    '': '',
    '0': '',
    'p': '波',
    'ph': '颇',
    'm': '毛',
    'b': '无',
    't': '多',
    'th': '胎',
    'n': '娜',
    'l': '罗',
    'k': '哥',
    'kh': '戈',
    'ng': '俄',
    'g': '鹅',
    'h': '何',
    'ts': '之',
    'tsh': '徐',
    's': '思',
    'j': '而',
  }
  const final_map = {
    '': '',
    'a': '亚',
    'o': '窝',
    'v': '余',
    'r': '倭',
    'e': '哑',
    'i': '衣',
    'u': '污',
    'ai': '埃',
    'au': '欧',
    'oi': '挨',
    'ou': '乌',
    'ia': '呀',
    'io': '腰',
    'iu': '忧',
    'iau': '妖',
    'ua': '娃',
    'ue': '锅',
    'ui': '威',
    'uai': '歪',
    'am': '庵',
    'ap': '庵',
    'an': '安',
    'at': '安',
    'ang': '红',
    'ak': '红',
    'ong': '翁',
    'ok': '翁',
    'eng': '英',
    'ek': '英',
    'im': '音',
    'ip': '音',
    'in': '因',
    'it': '因',
    'iam': '奄',
    'iap': '奄',
    'ian': '嫣',
    'iat': '嫣',
    'iang': '央',
    'iak': '央',
    'iong': '雍',
    'iok': '雍',
    'uam': '凡',
    'uap': '凡',
    'uan': '冤',
    'uat': '冤',
    'uang': '汪',
    'uak': '汪',
    'ueng': '荣',
    'uek': '荣',
    'un': '温',
    'ut': '温',
    'ng': '秧',
    'vn': '恩',
    'vt': '恩',
    'rm': '森',
    'ann': '嗳',
    'oinn': '闲',
    'enn': '楹',
    'inn': '丸',
    'iann': '影',
    'ionn': '羊',
    'uann': '鞍',

    'm': '姆',
  }
  let fq_initial = initial_map[pronunciation.initial];
  if (!fq_initial && fallback_pronunciation) {
    fq_initial = initial_map[fallback_pronunciation.initial];
  }
  if (fq_initial === undefined) {
    fq_initial = pronunciation.initial;
    console.error(`反切声母缺失：${fq_initial}`);
  }
  let final = pronunciation.final;
  final = final.replace("nn'", 'nn');
  let fq_final = final_map[final];
  if (fq_final === undefined) {
    // 这里剩下的是一些 h 尾入声和鼻化音，以及 m、ngh，都单独处理
    if (final.endsWith('nnh')) {
      fq_final = final_map[final.substring(0, final.length - 3)] + '(鼻化;喉塞)';
    } else if (final.endsWith('nn')) {
      fq_final = final_map[final.substring(0, final.length - 2)] + '(鼻化)';
    } else if (final.endsWith('h')) {
      fq_final = final_map[final.substring(0, final.length - 1)] + '(喉塞)';
    }
  }
  if (fq_final === undefined && fallback_pronunciation) {
    final = fallback_pronunciation.final;
    final = final.replace("nn'", 'nn');
    fq_final = final_map[final];
  }
  if (fq_final === undefined) {
    fq_final = final;
    console.error(`反切拼音缺失：${fq_final}`);
  }
  let fq_tone = pronunciation.tone;
  return new Pronunciation(fq_initial, fq_final, fq_tone);
}

const PUJInitialToXSAMPAMap = {
  '0': '?',
  'p': 'p',
  'pf': 'p_df',
  'ph': 'p_h',
  'phf': 'p_d_hf',
  'm': 'm',
  'mv': 'F',
  'b': 'b',
  'bv': 'b_d',
  't':'t',
  'th': 't_h',
  'n': 'n',
  'l': 'l',
  'k': 'k',
  'kh': 'k_h',
  'ng': 'N',
  'g': 'g',
  'h': 'h',
  'ts': 'ts',
  'ch': 'tS',
  'tsh': 'ts_h',
  'chh': 'tS_h',
  's': 's',
  'j': 'dz',
  'z': 'z',
}

const PUJFinalToXSAMPAMap = {
  'a': 'a',
  'o': 'o',
  'v': 'M',
  'r': '@',
  'e': 'e',
  'i': 'i',
  'u': 'u',

  'nn': '~',
  'ng': 'N',
  'n': 'n',
  'm': 'm',
  'h': '?',
  'k': 'k_}',
  't': 't_}',
  'p': 'p_}',
}

function convertPUJPronunciationToXSAMPAPronunciation(pronunciation) {
  const result = new Pronunciation(
      pronunciation.initial.toLowerCase(), pronunciation.final.toLowerCase(), pronunciation.tone);
  result.initial = PUJInitialToXSAMPAMap[result.initial] ?? result.initial;
  result.final = result.final.replace("'", '');
  for (const [key, value] of Object.entries(PUJFinalToXSAMPAMap)) {
    result.final = result.final.replace(key, value);
  }
  result.tone = '__' + result.tone;
  return result;
}

function convertXSAMPAToIPAWord(word) {
  for (const x_sampa of XSAMPAList) {
    const ipa = XSAMPAToIPAMap[x_sampa];
    word = word.replace(x_sampa, ipa);
  }
  return word;
}

function convertXSAMPAPronunciationToIPAPronunciation(pronunciation) {
  const result = new Pronunciation(pronunciation.initial, pronunciation.final, pronunciation.tone);
  result.initial = convertXSAMPAToIPAWord(result.initial);
  result.final = convertXSAMPAToIPAWord(result.final);
  result.tone = convertXSAMPAToIPAWord(result.tone);
  return result;
}

function convertPUJPronunciationToIPAPronunciation(pronunciation) {
  return convertXSAMPAPronunciationToIPAPronunciation(
      convertPUJPronunciationToXSAMPAPronunciation(pronunciation));
}

export {
  fuzzyRules,
  convertPlainPUJSentenceToDisplayPUJSentence,
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  convertPUJToDPSentence,
  convertPUJPronunciationToDPPronunciation,
  convertPUJPronunciationToFanQiePronunciation,
  convertXSAMPAToIPAWord,
  convertXSAMPAPronunciationToIPAPronunciation,
  convertPUJPronunciationToXSAMPAPronunciation,
  convertPUJPronunciationToIPAPronunciation,
}
