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

function unifyWordDisplay(word, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  word = word.replace(/0/g, '');
  word = word.replace(/v/g, v);
  word = word.replace(/V/g, V);
  word = word.replace(new RegExp(`(?<![eiyuEIYU][${PUJToneMarks.join('')}]?)r`, 'g'), r);
  word = word.replace(new RegExp(`(?<![eiyuEIYU][${PUJToneMarks.join('')}]?)R`, 'g'), R);
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
  // 多于一个且第一个是 iu 的话，iu 就是介音，直接去掉。
  if (vowelsIndices.length > 1 && "iyuIYU".includes(word[vowelsIndices[0]])) {
    // 这里特殊判断下不是 ir/ur
    if (!("rR".includes(word[vowelsIndices[1]]))) {
      vowelsIndices.shift();
    }
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
  return unifyWordDisplay(addPUJToneMark(sentence));
}

export {
  fuzzyRules,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
}

export default {}
</script>