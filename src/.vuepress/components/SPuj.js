import { getLocalOption } from "./SUtils.js";
import { Pronunciation } from "./SCommon.js";
import { XSAMPAList, XSAMPAToIPAMap } from "./SXSampaIpa.js";

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
// 使用 v r 代替 ir/ur/er 的版本。如果有 sirm 这样的组合，那么 i 是介音，r 是韵腹。
const regexpWord = /^(?<initial>p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0)?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiuvr]))?(?<nucleus>a|e|o|i|u|v|r|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*)(?<tone>\d)?)$/i;
// 保留 ir/ur/er 的版本。如果有 sirm 这样的组合，那么 ir 是一个整体。
const regexpWordOptional = /^(?<initial>p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0)?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiu]))?(?<nucleus>a|e|o|i|u|v|ur|ir|r|er|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*)(?<tone>\d)?)$/i;
// 只分为 initial final 两部分。
const regexpWordSimple = /^(?<initial>p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0)?(?<final>[aeoyiuvr]*(m|n|ng|nn'?|p|t|k|h)|ng|ngh|m|mh)$/i;

class FuzzyRuleBase {
  fuzzy(result) { return result; }
}

const AtomicFuzzyRule = {
  V_As_U: result => { if (result.final === 'v') result.final = 'u'; },
  R_As_O: result => { if (result.final === 'r') result.final = 'o'; },
  R_As_E: result => { if (result.final === 'r') result.final = 'e'; },
  RH_As_OH: result => { if (result.final === 'rh') result.final = 'oh'; },
  RM_As_IAM: result => { if (result.final === 'rm') result.final = 'iam'; },
  EU_As_IU: result => { if (result.final === 'eu') result.final = 'iu'; },
  OINN_As_AINN: result => { if (result.final === 'oinn') result.final = 'ainn'; },
  UOINN_As_UINN: result => { if (result.final === 'uoinn') result.final = 'uinn'; },
  UOINN_As_UAINN: result => { if (result.final === 'uoinn') result.final = 'uainn'; },
  OI_As_UE: result => { if (result.initial.match(/^(p|ph|m|b)$/)) result.final = result.final.replace(/^oi(nn|h|nnh)*/, 'ue$1'); },
  OU_As_AU: result => { if (result.final.startsWith('ou')) result.final = result.final.replace('ou', 'au'); },
  UE_As_UEI: result => { result.final = result.final.replace(/^ue(h|nn|nn'h)?$/, 'uei$1'); },
  VN_As_IN: result => { result.final = result.final.replace(/^v([nt])$/, 'i$1'); },
  IN_As_EN: result => { result.final = result.final.replace(/^i([nt])$/, 'e$1'); },
  UENG_As_ENG: result => { if (result.final === 'ueng') result.final = result.initial === '0' ? 'eng' : 'uang'; },
  UEK_As_UAK: result => { if (result.final === 'uek') result.final = 'uak'; },
  IO_As_IE: result => { result.final = result.final.replace(/^io(nn'?|h|nn'?h)*$/, 'ie$1'); },
  IAU_As_IEU: result => { result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'ieu$1'); },
  IAU_As_IOU: result => { result.final = result.final.replace(/^iau(nn'?|h|nn'?h)*$/, 'iou$1'); },
  IAN_As_IEN: result => { result.final = result.final.replace(/^ia([nt])$/, 'ie$1'); },
  UAN_As_UEN: result => { result.final = result.final.replace(/^ua([nt])$/, 'ue$1'); },
  IAM_As_IEM: result => { result.final = result.final.replace(/^ia([mp])$/, 'ie$1'); },
  N_As_L_ForMEnding: result => { if (result.final.endsWith('m') && result.initial === 'n') result.initial = 'l'; },
  N_As_L_ForNOrNGEnding: result => { if ((result.final.endsWith('n') || result.final.endsWith('ng')) && result.initial === 'n') result.initial = 'l'; },
  L_As_N_ForMEnding: result => { if (result.final.endsWith('m') && result.initial === 'l')result.initial = 'n'; },
  MU_As_BU_ForNasalEnding: result => { if (result.initial === 'm' && result.final.match(/^u[aoveiu]*(m|n|ng)$/)) result.initial = 'b'; },
  BU_As_MU_ForNasalEnding: result => { if (result.initial === 'b' && result.final.match(/^u[aoveiu]*(m|n|ng)$/)) result.initial = 'm'; },
  N_As_NG: result => {
    result.final = result.final.replace(/^([aoveiu]+)n$/, '$1ng');
    result.final = result.final.replace(/^([aoveiu]+)t$/, '$1k');
  },
  M_As_NG: result => {
    result.final = result.final.replace(/^([aoveiu]+)m$/, '$1ng');
    result.final = result.final.replace(/^([aoveiu]+)p$/, '$1k');
  },
  ENG_As_EN: result => {
    if (result.final === 'eng') result.final = 'en';
    if (result.final === 'ek') result.final = 'et';
  },
  NG_As_UNG: result => { if (result.initial.match(/^(p|ph|m|b)$/) && result.final === 'ng') result.final = 'ung'; },
  NG_As_VNG: result => { if (result.final === 'ng' && result.initial !== 'h' && result.initial !== '0') result.final = 'vng'; },
  IONG_As_ONG: result => {
    if (result.initial.match(/^(t|th|n|l|ts|tsh|s|j)$/) && result.final === 'iong') result.final = 'ong';
    if (result.initial.match(/^(t|n|l|ts|tsh|s|j)$/) && result.final === 'iok') result.final = 'ok';
  },
  NGU_As_U: result => { if (result.initial === 'ng' && result.final === 'u') result.initial = '0'; },
  RemoveApostrophe: result => { result.final = result.final.replace("'", ''); },
  RemoveFinalNasalizationForNasalInitial: result => {
    if (result.initial === 'm' || result.initial === 'n' || result.initial === 'ng')
      if (result.final.endsWith('nn'))
        result.final = result.final.replace('nn', '');
  }
}

class FuzzyRulesGroup extends FuzzyRuleBase {
  constructor(name, rules) {
    super();
    this.name = name;
    this.rules = rules;
  }
  fuzzy(original) {
    let result = original.clone();
    for (const rule of this.rules)
      rule(result);
    return result;
  }
}

class FuzzyRulesGroup_Dummy extends FuzzyRulesGroup {
  constructor() {
    super('辞典', []);
  }
}

class FuzzyRulesGroup_ChaoZhou extends FuzzyRulesGroup {
  constructor() {
    super('潮州', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.IO_As_IE,
      AtomicFuzzyRule.IAU_As_IEU,
      AtomicFuzzyRule.IAN_As_IEN,
      AtomicFuzzyRule.UAN_As_UEN,
      AtomicFuzzyRule.IAM_As_IEM,
      AtomicFuzzyRule.N_As_L_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_UNG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_XiQiang extends FuzzyRulesGroup {
  constructor() {
    super('戏腔', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.IO_As_IE,
      AtomicFuzzyRule.IAU_As_IOU,
      AtomicFuzzyRule.N_As_L_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_ChaoAn extends FuzzyRulesGroup {
  constructor() {
    super('潮安', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.OI_As_UE,
      AtomicFuzzyRule.IAN_As_IEN,
      AtomicFuzzyRule.N_As_L_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_FengShun extends FuzzyRulesGroup {
  constructor() {
    super('丰顺', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.IO_As_IE,
      AtomicFuzzyRule.IAU_As_IEU,
      AtomicFuzzyRule.IAN_As_IEN,
      AtomicFuzzyRule.UAN_As_UEN,
      AtomicFuzzyRule.IAM_As_IEM,
      AtomicFuzzyRule.N_As_L_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.ENG_As_EN,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_RaoPing extends FuzzyRulesGroup {
  constructor() {
    super('饶平', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.OI_As_UE,
      AtomicFuzzyRule.N_As_L_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.BU_As_MU_ForNasalEnding,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_ChengHai extends FuzzyRulesGroup {
  constructor() {
    super('澄海', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.UENG_As_ENG,
      AtomicFuzzyRule.UEK_As_UAK,
      AtomicFuzzyRule.IO_As_IE,
      AtomicFuzzyRule.IAU_As_IOU,
      AtomicFuzzyRule.L_As_N_ForMEnding,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.M_As_NG,
      AtomicFuzzyRule.NG_As_UNG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_ShanTou extends FuzzyRulesGroup {
  constructor() {
    super('汕头', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.UOINN_As_UINN,
      AtomicFuzzyRule.UENG_As_ENG,
      AtomicFuzzyRule.UEK_As_UAK,
      AtomicFuzzyRule.IO_As_IE,
      AtomicFuzzyRule.IAU_As_IOU,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_UNG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_JieYang extends FuzzyRulesGroup {
  constructor() {
    super('揭阳', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.OINN_As_AINN,
      AtomicFuzzyRule.UOINN_As_UAINN,
      AtomicFuzzyRule.N_As_L_ForNOrNGEnding,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.VN_As_IN,
      AtomicFuzzyRule.IN_As_EN,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.IONG_As_ONG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_ChaoYang extends FuzzyRulesGroup {
  constructor() {
    super('潮阳', [
      AtomicFuzzyRule.V_As_U,
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.OINN_As_AINN,
      AtomicFuzzyRule.UOINN_As_UAINN,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.VN_As_IN,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_PuNing extends FuzzyRulesGroup {
  constructor() {
    super('普宁', [
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.OINN_As_AINN,
      AtomicFuzzyRule.UOINN_As_UAINN,
      AtomicFuzzyRule.VN_As_IN,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.NGU_As_U,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_HuiLai extends FuzzyRulesGroup {
  constructor() {
    super('惠来', [
      AtomicFuzzyRule.V_As_U,
      AtomicFuzzyRule.R_As_O,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.OINN_As_AINN,
      AtomicFuzzyRule.UOINN_As_UAINN,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.VN_As_IN,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

class FuzzyRulesGroup_LuFeng extends FuzzyRulesGroup {
  constructor() {
    super('陆丰', [
      AtomicFuzzyRule.V_As_U,
      AtomicFuzzyRule.R_As_E,
      AtomicFuzzyRule.RH_As_OH,
      AtomicFuzzyRule.RM_As_IAM,
      AtomicFuzzyRule.EU_As_IU,
      AtomicFuzzyRule.OINN_As_AINN,
      AtomicFuzzyRule.UOINN_As_UAINN,
      AtomicFuzzyRule.OU_As_AU,
      AtomicFuzzyRule.MU_As_BU_ForNasalEnding,
      AtomicFuzzyRule.UE_As_UEI,
      AtomicFuzzyRule.N_As_NG,
      AtomicFuzzyRule.NG_As_VNG,
      AtomicFuzzyRule.RemoveApostrophe,
      AtomicFuzzyRule.RemoveFinalNasalizationForNasalInitial,
    ]);
  }
}

// 模糊音规则
const fuzzyRules = {
  dummy: new FuzzyRulesGroup_Dummy(),
  chaozhou: new FuzzyRulesGroup_ChaoZhou(),
  xiqiang: new FuzzyRulesGroup_XiQiang(),
  chaoan: new FuzzyRulesGroup_ChaoAn(),
  fengshun: new FuzzyRulesGroup_FengShun(),
  raoping: new FuzzyRulesGroup_RaoPing(),
  chenghai: new FuzzyRulesGroup_ChengHai(),
  shantou: new FuzzyRulesGroup_ShanTou(),
  jieyang: new FuzzyRulesGroup_JieYang(),
  chaoyang: new FuzzyRulesGroup_ChaoYang(),
  puning: new FuzzyRulesGroup_PuNing(),
  huilai: new FuzzyRulesGroup_HuiLai(),
  lufeng: new FuzzyRulesGroup_LuFeng(),
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

function convertPlainPUJSentenceToDisplayPUJSentence(sentence, optional = false, v = PUJSpecialVowels['v'], V = PUJSpecialVowels['V'], r = PUJSpecialVowels["r"], R = PUJSpecialVowels["R"]) {
  sentence = sentence.replace(/0/g, '');
  if (!optional) {
    // sentence = sentence.replace(/nn(\W)/g, 'ⁿ$1');
    sentence = sentence.replace(/v(?![uU])/g, v);
    sentence = sentence.replace(/V(?![uU])/g, V);
    sentence = sentence.replace(new RegExp(`r`, 'g'), r);
    sentence = sentence.replace(new RegExp(`R`, 'g'), R);
  }
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

function addPUJToneMarkSentence(sentence, optional) {
  let result = "";
  forEachWordInSentence(sentence,
    (cur) => {
      result += addPUJToneMarkWord(cur, null, optional);
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
function addPUJToneMarkWord(word, tone, optional) {
  if (tone === 0 || tone === 1 || tone === 4) {
    return word;
  }
  if (!tone) {
    tone = 0;
    for (let i = word.length - 1; i >= 0; --i) {
      if (word[i] >= '1' && word[i] <= '8') {
        tone = parseInt(word[i]);
        word = word.substring(0, i) + word.substring(i + 1);
        break;
      }
    }
  }
  const match = word.match(optional ? regexpWordOptional : regexpWord);
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
  const match = word.match(regexpWordSimple);
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

function addPUJToneMarkAndConvertToDisplayPUJSentence(sentence, optional = false) {
  return convertPlainPUJSentenceToDisplayPUJSentence(addPUJToneMarkSentence(sentence, optional), optional);
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
  result.final = result.final.replace(/(?<!n)n$/, 'nd');
  result.final = result.final.replace('nn', 'n');
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
    'uoinn': '县',

    'm': '姆',
  }
  let fq_initial = initial_map[pronunciation.initial];
  if (fq_initial === undefined && fallback_pronunciation) {
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
    let special = null;
    if (final.endsWith('nnh')) {
      fq_final = final_map[final.substring(0, final.length - 3)];
      special = '(鼻化;喉塞)';
    } else if (final.endsWith('nn')) {
      fq_final = final_map[final.substring(0, final.length - 2)];
      special = '(鼻化)';
    } else if (final.endsWith('h')) {
      fq_final = final_map[final.substring(0, final.length - 1)];
      special = '(喉塞)';
    }
    if (fq_final !== undefined) {
      fq_final = fq_final + special;
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
  't': 't',
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
