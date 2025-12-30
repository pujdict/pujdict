import {getLocalOption} from "./SUtils";
import {Pronunciation} from "./SCommon";
import {XSAMPAList, XSAMPAToIPAMap} from "./SXSampaIpa";

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
function getToneFromPUJDisplay(word): [number, string] {
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
          tone = parseInt(curTone);
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
  // "v": "ṳ",
  "ur": "ṳ",
  "ir": "ṳ",
  // "r": "o̤",
  "er": "o̤",
  "or": "o̤",
};

/*
lang def:
  word ::= (initial) final (tone)
  initial ::= "p" | "ph" | "m" | "b" | "t" | "th" | "n" | "l" | "k" | "kh" | "ng" | "g" | "h" | "ts" | "tsh" | "s" | "j" | ""
  final ::= (medial) nucleus (coda)
  medial ::= "i" | "u"
  nucleus ::= "a" | "e" | "o" | "i" | "u" | "v" | "r" | "m" | "ng"
  coda ::= "u" | "i" | "m" | "n" | "ng" | "nn" | "p" | "t" | "k" | "h" | "nnh"
*/
// 使用 v r 代替 ir/ur/er 的版本。如果有 sirm 这样的组合，那么 i 是介音，r 是韵腹。
// 已废弃。
const regexpWord = /^(?<initial>(p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0)'?)?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiuvr]))?(?<nucleus>a|e|o|i|u|v|r|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*))?(?<tone>\d)?$/i;
// 保留 ir/ur/er 的版本。如果有 sirm 这样的组合，那么 ir 是一个整体。
const regexpWordOptional = /^(?<initial>(p|ph|m|b|pf|pfh|mv(?=u)|bv(?=u)|f|t|th|n|l|k|kh|ng|g|h|ts|c|ch|tsh|chh|s|j|z|0))?(?<final>(?<medial>(y|yi|i|u)(?=[aeoiu]))?(?<nucleus>a|e|o|i|u|v|ur|ir|ṳ|or|er|o̤|ng|m)(?<coda>(y|yi|i|u)?(m|n|ng|nn'?|p|t|k|h)*))(?<tone>\d)?$/i;
const regexpWordDp = /(?<initial>(b|p|m|bh|d|t|n|l|g|k|ng|gh|h|z|c|s|r|0))?(?<final>(?<medial>(i|u)(?=[aeoiu]))?(?<nucleus>a|e|ê|ê|ee|o|i|u|v|or|er|ng|m)(?<coda>(i|u)?(m|nd|ng|n'?|b|d|g|h)*))(?<tone>\d)?$/i;

class FuzzyRuleBase {
  fuzzy(result) { return result; }
}

const AtomicFuzzyRule = {
  RemoveApostrophe: result => { result.initial = result.initial.replace("'", ''); result.final = result.final.replace("'", ''); },
  RemoveFinalNasalizationForNasalInitial: result => {
    if (result.initial === 'm' || result.initial === 'n' || result.initial === 'ng')
      if (result.final.endsWith('nn'))
        result.final = result.final.replace('nn', '');
  }
}

class FuzzyRulesGroup extends FuzzyRuleBase {
  isCustom: boolean;
  name: string;
  accentTones: { citation: number[]; sandhi: number[]; neutral: number[]; group: any };
  rules: Array<any>;
  constructor(name: string,
              accentTones: {citation: number[], sandhi: number[], neutral: number[], group: any},
              rules: Array<any>) {
    super();
    this.name = name;
    this.accentTones = accentTones;
    this.rules = rules;
  }
  fuzzy(original) {
    let result = new Pronunciation(original.initial, original.final, original.tone);
    for (const rule of this.rules)
      rule(result);
    return result;
  }
}

class FuzzyRulesGroup_Dummy extends FuzzyRulesGroup {
  constructor() {
    super('辞典', {
      // 默认音以潮剧调为标准
      citation: [33, 52, 212, 2, 55, 25, 22, 5],
      sandhi: [33, 23, 32, 3, 212, 21, 21, 2],
      neutral: [22, 212, 21, 2, 22, 21, 22, 2],
      group: {
        "2-2": "25-21",
        "2-5": "25-55",
        "2-8": "25-5",
        "3-2": "52-21",
        "3-5": "52-55",
        "3-8": "52-5",
        "4-2": "5-21",
        "4-5": "5-55",
        "4-8": "5-5",
      },
    }, [
    ]);
  }
}

function convertPlainPUJSentenceToDisplayPUJInSentence(sentence) {
  sentence = sentence.replace(/0/g, '');
  {
    // sentence = sentence.replace(/nn(\W)/g, 'ⁿ$1');
    sentence = sentence.replace(/ur|ir/g, PUJSpecialVowels['ur']);
    sentence = sentence.replace(/er|or/g, PUJSpecialVowels['er']);
  }
  // sentence = sentence.replace(/(o)(\W*)(')/g, `${o2}$2`);
  // sentence = sentence.replace(/(O)(\W*)(')/g, `${O2}$2`);
  return sentence;
}

enum ESentenceLetterCase {
  NONE = 0,
  LOWER = 1,
  UPPER_FIRST_LETTER = 2,
  UPPER = 3,
}

function determineSentenceLetterCase(sentence: string): ESentenceLetterCase {
  let firstLetter = true;
  let hasLower = false;
  let hasUpper = false;
  let lettersCnt = 0;
  for (let i = 0; i < sentence.length; ++i) {
    let char = sentence[i];
    if (/[a-zA-Z]/.test(char)) {
      ++lettersCnt;
      if (/[a-z]/.test(char)) {
        if (firstLetter) {
          return ESentenceLetterCase.LOWER;
        } else {
          hasLower = true;
        }
      } else {
        hasUpper = true;
      }
      firstLetter = false;
    }
  }
  if (hasLower && hasUpper || hasUpper && lettersCnt === 1) {
    return ESentenceLetterCase.UPPER_FIRST_LETTER;
  }
  if (hasUpper) {
    return ESentenceLetterCase.UPPER;
  }
  return ESentenceLetterCase.NONE;
}

function changeSentenceLetterCase(sentence: string, sentenceCase: ESentenceLetterCase): string {
  switch (sentenceCase) {
    case ESentenceLetterCase.LOWER:
      return sentence.toLowerCase();
    case ESentenceLetterCase.UPPER:
      return sentence.toUpperCase();
    case ESentenceLetterCase.UPPER_FIRST_LETTER:
      let res = [...sentence];
      let isCurrentSentenceFixed = false;
      for (let i = 0; i < res.length; ++i) {
        if (!isCurrentSentenceFixed && /[a-z]/.test(res[i])) {
          res[i] = res[i].toUpperCase();
          isCurrentSentenceFixed = true;
        }
        if (/[\?\!\.]/.test(res[i])) {
          isCurrentSentenceFixed = false;
        }
      }
      return res.join('');
  }
  return sentence;
}

function convertPlainPUJSentence(sentence: string, fuzzyRule = new FuzzyRulesGroup_Dummy(), funcPlainPUJPronunciationToStr, funcNonWordStr = null) {
  let result = '';
  let isInNeutral = false;
  let sentenceLetterCase = determineSentenceLetterCase(sentence);
  forEachWordInSentence(sentence.toLowerCase(), (word, nextHyphenCount) => {
    let isNeutral = isInNeutral;
    let isSandhi = false;
    switch (nextHyphenCount) {
      case 0:
        isSandhi = false;
        isInNeutral = false;
        break;
      case 1:
        isSandhi = true;
        break;
      case 2:
        isSandhi = false;
        isInNeutral = true;
        break;
    }
    let pronunciation = convertPlainPUJToPronunciationWord(word);
    let fuzzy = fuzzyRule.fuzzy(pronunciation);
    let str = funcPlainPUJPronunciationToStr(fuzzy, isSandhi, isNeutral);
    result += str;
  },  (word) => {
    result += funcNonWordStr ? funcNonWordStr(word) : word;
  });
  return changeSentenceLetterCase(result, sentenceLetterCase);
}

function convertPlainPUJSentenceToPUJSentence(sentence, fuzzyRule = new FuzzyRulesGroup_Dummy()) {
  return convertPlainPUJSentence(sentence, fuzzyRule, (pron, isSandhi, isNeutral) => {
    return addPUJToneMarkWord(convertPlainPUJSentenceToDisplayPUJInSentence(getPronunciationCombination(pron)), null);
  }, (nonWord) => {
    return nonWord;
  });
}

function convertPlainPUJSentenceToIPASentence(sentence: string, fuzzyRule = new FuzzyRulesGroup_Dummy()) {
  const tokens = getTokensInSentence(sentence.toLowerCase());
  let i = 0;
  let result = '';
  // First pass: find out sandhi groups and the citation indices.
  let sandhiGroupLastWordIndices = [];
  let sandhiGroupCitationWordIndices = [];
  let importantIndicesSet = new Set();
  let wordIndices = [];
  let sandhiGroupIndicesPairs = [];
  let lastSandhiGroupLastWordIndex = -1;
  let foundCurrentCitation = false;
  while (i < tokens.length) {
    const token = tokens[i];
    const seek1 = tokens[i + 1];
    if (token.category === EPUJTokenCategory.WORD) {
      // If a PUJ word is not followed by '-' '- ', or is followed by '--' '-- ' ' -', then we got the citation.
      if (!foundCurrentCitation && (!seek1 || (seek1 && [
        EPUJHyphenCategory.NONE,
        EPUJHyphenCategory.PRE,
        EPUJHyphenCategory.DOUBLE_BREAK,
        EPUJHyphenCategory.DOUBLE_CONNECT,
      ].includes(seek1.hyphenCategory)))) {
        foundCurrentCitation = true;
        let lastCitationIndex = sandhiGroupCitationWordIndices[sandhiGroupCitationWordIndices.length - 1] || -1;
        sandhiGroupCitationWordIndices.push(i);
        let lastWordIndex = wordIndices[wordIndices.length - 1];
        // The word before the citation is important.
        if (lastWordIndex !== undefined) {
          if (lastWordIndex !== lastCitationIndex) {
            importantIndicesSet.add(lastWordIndex);
          }
        }
      }
      // If a PUJ word is not followed by '- ' '-' '-- ' '--', then we got the end of current sandhi group.
      if (!seek1 ||
        ![EPUJHyphenCategory.POST,
          EPUJHyphenCategory.CONNECT,
          EPUJHyphenCategory.DOUBLE_BREAK,
          EPUJHyphenCategory.DOUBLE_CONNECT].includes(seek1.hyphenCategory)) {
        sandhiGroupLastWordIndices.push(i);
        sandhiGroupIndicesPairs.push([lastSandhiGroupLastWordIndex, i]);
        lastSandhiGroupLastWordIndex = i;
        foundCurrentCitation = false;
      }
      wordIndices.push(i);
    }
    ++i;
  }
  if (wordIndices.length && wordIndices[wordIndices.length - 1] !== lastSandhiGroupLastWordIndex) {
    // The last word has not ended yet.
    sandhiGroupIndicesPairs.push([lastSandhiGroupLastWordIndex, i - 1]);
    lastSandhiGroupLastWordIndex = i - 1;
  }
  // Second pass: iterate over all tokens and generate IPA writing for all words
  let sandhiGroupCitationWordIndicesSet = new Set(sandhiGroupCitationWordIndices);
  for (const [beginIndexExc, endIndexInc] of sandhiGroupIndicesPairs) {
    let ipaProns = [];
    let ipaToneValues = [];
    let citationIndex = Infinity; // The index of the tokens array
    let citationIndexInGroup = Infinity; // The index in current sandhi group
    // 1. generate general tone values
    for (let j = beginIndexExc + 1, kWordIndexInGroup = 0; j <= endIndexInc; ++j) {
      const token = tokens[j];
      if (token.category !== EPUJTokenCategory.WORD)
        continue;
      let pron = token.spelling;
      let fuzzyPron = fuzzyRule.fuzzy(convertPlainPUJToPronunciationWord(pron));
      let ipaPron = convertPUJPronunciationToIPAPronunciation(fuzzyPron);
      ipaProns.push(ipaPron);
      // TODO: 支持自定义调值
      let accentTones = fuzzyRule.isCustom ? new FuzzyRulesGroup_Dummy().accentTones : fuzzyRule.accentTones;
      let toneValue;
      if (sandhiGroupCitationWordIndicesSet.has(j)) {
        toneValue = accentTones.citation[ipaPron.tone - 1];
        citationIndex = j;
        citationIndexInGroup = kWordIndexInGroup;
      } else if (j < citationIndex) {
        toneValue = accentTones.sandhi[ipaPron.tone - 1];
      } else if (j > citationIndex) {
        toneValue = accentTones.neutral[ipaPron.tone - 1];
      }
      ipaToneValues.push(toneValue);
      ++kWordIndexInGroup;
    }
    // 2. Handle special tones
    if (citationIndexInGroup !== Infinity && citationIndexInGroup > 0) {
      let importantIndexInGroup = citationIndexInGroup - 1;
      let importantTone = ipaProns[importantIndexInGroup].tone;
      let citationTone = ipaProns[citationIndexInGroup].tone;
      let group = fuzzyRule.accentTones.group[`${importantTone}-${citationTone}`];
      if (group) {
        let [importantToneValue, citationToneValue] = group.split('-');
        ipaToneValues[importantIndexInGroup] = parseInt(importantToneValue);
        ipaToneValues[citationIndexInGroup] = parseInt(citationToneValue);
      }
    }
    // 3. Generate displaying result
    for (let j = beginIndexExc + 1, kWordIndexInGroup = 0; j <= endIndexInc; ++j) {
      const token = tokens[j];
      if (token.category !== EPUJTokenCategory.WORD) {
        if (token.category === EPUJTokenCategory.OTHER) {
          result += token.spelling;
        } else if (token.category === EPUJTokenCategory.HYPHEN) {
          // Dot in IPA is used like a word separator.
          result += `·`;
        }
        continue;
      }
      let toneValue = ipaToneValues[kWordIndexInGroup];
      let isSandhi = kWordIndexInGroup !== citationIndexInGroup;
      let ipaPron = ipaProns[kWordIndexInGroup];
      let ipaTone = convertToneValueToToneLetters(toneValue, isSandhi);
      result += `${ipaPron.initial}${ipaPron.final}${ipaTone}`;
      ++kWordIndexInGroup;
    }
  }
  // Characters after the last sandhi group, maybe some punctuations.
  if (sandhiGroupIndicesPairs.length) {
    for (let j = sandhiGroupIndicesPairs[sandhiGroupIndicesPairs.length - 1][1] + 1; j < tokens.length; ++j) {
      result += tokens[j].spelling;
    }
  }
  return result;
}

function convertPlainPUJSentenceToDPSentence(sentence, fuzzyRule = new FuzzyRulesGroup_Dummy()) {
  return convertPlainPUJSentence(sentence, fuzzyRule,  (pron, isSandhi, isNeutral) => {
    let dpPron = convertPUJPronunciationToDPPronunciation(pron);
    return getPronunciationCombination(dpPron);
  });
}

function convertPUJFromDisplaySentence(sentence) {
  // sentence = sentence.replace(/ⁿ/g, 'nn');
  sentence = sentence.replace(new RegExp(PUJSpecialVowels['ur'], 'g'), 'ur');
  sentence = sentence.replace(new RegExp(PUJSpecialVowels['ir'], 'g'), 'ir');
  return sentence;
}

const EPUJTokenCategory = {
  NONE: 0,
  WORD: 1,
  HYPHEN: 2,
  OTHER: 4,
}

const EPUJHyphenCategory = {
  NONE: 0,
  POST: 1,
  PRE: 2,
  CONNECT: 3,
  DOUBLE_BREAK: 4,
  DOUBLE_CONNECT: 5,
}

class PUJToken {
  spelling = '';
  category = EPUJTokenCategory.NONE;
  hyphenCategory = EPUJHyphenCategory.NONE;
  constructor(spelling, category, hyphenCategory) {
    this.spelling = spelling;
    this.category = category;
    this.hyphenCategory = hyphenCategory;
  }
}

function getTokensInSentence(sentence) {
  sentence = sentence.normalize('NFD');
  const regexp = new RegExp(`[a-zA-Z0-9']|̤|${getPUJToneMarks().filter(e => e.length).join('|')}`);
  let i = 0;
  let tokens = [];
  while (i < sentence.length) {
    let cur = "";
    if (regexp.test(sentence[i])) {
      while (i < sentence.length && regexp.test(sentence[i])) {
        cur += sentence[i++];
      }
      tokens.push(new PUJToken(cur, EPUJTokenCategory.WORD, EPUJHyphenCategory.NONE));
    } else {
      // Try to find hyphens. There are 5 possible kinds of hyphens:
      // 1. post-hyphen, written after one PUJ word, followed by a space. i.e. `xxx- `
      // 2. pre-hyphen, written before the next PUJ word, preceded by a space. i.e. ` -xxx`
      // 3. connecting-hyphen, written between two PUJ words with no additional spaces. i.e. `xxx-xxx`
      // 4. breaking double-hyphen, written after one PUJ word, followed by a space. i.e. `xxx-- `
      // 5. connecting double-hyphen, written between two PUJ words. i.e. `xxx--xxx`
      while (i < sentence.length && !regexp.test(sentence[i])) {
        cur += sentence[i++];
      }
      const seek1 = sentence[i];
      switch (cur) {
        case '':
          break;
        case '- ':
          tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.POST));
          break;
        case ' -':
          tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.PRE));
          break;
        case '-':
          if (seek1 && regexp.test(seek1))
            tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.CONNECT));
          else
            // A single hyphen may be followed by nothing. e.g. `mak8 siap4-kau3-`
            tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.POST));
          break;
        case '-- ':
          tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.DOUBLE_BREAK));
          break;
        case '--':
          if (!seek1)
            console.error(`A double-hyphen is followed by nothing: ${sentence}`);
          tokens.push(new PUJToken(cur, EPUJTokenCategory.HYPHEN, EPUJHyphenCategory.DOUBLE_CONNECT));
          break;
        default:
          tokens.push(new PUJToken(cur, EPUJTokenCategory.OTHER, EPUJHyphenCategory.NONE));
          break;
      }
    }
  }
  return tokens;
}

function forEachWordInSentence(sentence, funcWord, funcNonWord) {
  sentence = sentence.normalize('NFD');
  const regexp = new RegExp(`[a-zA-Z0-9']|̤|${getPUJToneMarks().filter(e => e.length).join('|')}`);
  let nextHyphenCount = 0;
  let i = 0;
  while (i < sentence.length) {
    let cur = "";
    if (regexp.test(sentence[i])) {
      while (i < sentence.length && regexp.test(sentence[i])) {
        cur += sentence[i++];
      }
      nextHyphenCount = 0;
      if (i < sentence.length && sentence[i] === '-') {
        ++nextHyphenCount;
        if  (i + 1 < sentence.length && sentence[i + 1] === '-') {
          ++nextHyphenCount;
        }
      }
      funcWord?.(cur, nextHyphenCount);
    } else {
      while (i < sentence.length && !regexp.test(sentence[i])) {
        cur += sentence[i++];
      }
      funcNonWord?.(cur);
    }
  }
}

function addPUJToneMarkSentence(sentence) {
  let result = "";
  forEachWordInSentence(sentence,
    (cur) => {
      result += addPUJToneMarkWord(cur, null);
    },
    (cur) => {
      result += cur;
    });
  // 为了美观轻声调用点表示
  // result = result.replace(/(?<=\S)--(?=\S)/g, '·');
  return result;
}

/**
 * 为单个字添加音调符号
 */
function addPUJToneMarkWord(word: string, tone = 0): string {
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
  const match = word.match(regexpWordOptional);
  if (match) {
    let initial = match.groups.initial ?? '';
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
    console.log(`Not a full word: ${word} ${tone}`)
    return word;
  }
}

function undoAddPUJToneMarkWord(word) {
  let initial = '';
  let final = '';
  let tone = 0;
  if (!word.length) return null;

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
  const match = word.match(regexpWordOptional);
  if (match) {
    if (match.groups.initial) {
      initial = match.groups.initial;
    }
    if (match.groups.final) {
      final = match.groups.final;
    }
  } else {
    // TODO: 需要重构，现在的逻辑单写 ng- l- n- b- 等等，ng 会被判定为 final，其他会被判定为 initial。暂时这么改能 work。
    if (PUJ_DP_INITIAL_MAP[word])
      return new Pronunciation(word, '', 0);
  }

  return new Pronunciation(initial, final, tone);
}

function addPUJToneMarkAndConvertToDisplayPUJSentence(sentence) {
  return addPUJToneMarkSentence(convertPlainPUJSentenceToDisplayPUJInSentence(sentence));
}

function convertPlainPUJToPronunciationWord(word) {
  word = convertPUJFromDisplaySentence(word);
  let pronunciation = undoAddPUJToneMarkWord(word);
  return pronunciation;
}

const PUJ_DP_INITIAL_MAP = {
  '0': '',
  '': '',
  'p': 'b',
  'ph': 'p',
  'm': 'm',
  'b': 'bh',
  'pf': 'bf',
  'phf': 'pf',
  'mv': 'mv',
  'bv': 'bhv',
  'f': 'f',
  'v': 'v',
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
const DP_PUJ_INITIAL_MAP = {
  '0': '',
  '': '',
  'b': 'p',
  'p': 'ph',
  'm': 'm',
  'bh': 'b',
  'bf': 'pf',
  'pf': 'phf',
  'mv': 'mv',
  'bhv': 'bv',
  'f': 'f',
  'v': 'v',
  'd': 't',
  't': 'th',
  'n': 'n',
  'l': 'l',
  'g': 'k',
  'k': 'kh',
  'ng': 'ng',
  'gh': 'g',
  'h': 'h',
  'z': 'ts',
  'c': 'tsh',
  's': 's',
  'r': 'j',
}

function convertPUJInitialOrFinalToDP(part) {
  let try_to_map_initial = PUJ_DP_INITIAL_MAP[part];
  if (try_to_map_initial) {
    return try_to_map_initial;
  }

  // 特殊韵母
  part = part.replace('e', 'ê');
  part = part.replace('ur', 'e');
  part = part.replace('ir', 'e');
  part = part.replace('or', 'er');
  part = part.replace('iau', 'iao');
  part = part.replace('au', 'ao');
  // 鼻化韵尾
  part = part.replace(/(?<!n)n$/, 'nd');
  part = part.replace('nn', 'n');
  // 入声韵尾
  part = part.replace(/p$/, 'b');
  part = part.replace(/t$/, 'd');
  part = part.replace(/k$/, 'g');

  return part;
}

function convertDPWordToPronunciation(dp) {
  const matchDP = dp.match(regexpWordDp);
  if (!matchDP) return null;
  let initial = matchDP.groups.initial;
  if (!initial || initial === '0') initial = '';
  let final = matchDP.groups.final;
  let tone = matchDP.groups.tone;
  return new Pronunciation(initial, final, tone);
}

function convertDPPronunciationToPUJPronunciation(dpPron) {
  if (!dpPron) return dpPron;
  let initial = DP_PUJ_INITIAL_MAP[dpPron.initial];
  if (!initial || initial === '0') initial = '';
  let final = dpPron.final.normalize('NFC'); // ê 作为单个字符
  final = final.replace('er', 'or');
  // 单韵母“余 秧”特殊处理，后续的所有单独存在的 e，都只可能是 iem/ieb/ieu(-nn/-h) 这几个。
  // 这两属于府城特色音，iam iap iau 的高化。
  // 辞典和 ieng/iek 保持一致，统一把这个府城特色高化记为 e，不记为 ur/or，减少记忆负担。与之对应的，潮拼改标记为 iêm/iêb/iêu。
  // 但用户的输入，支持写 iem ieb ieu。
  if (final === 'e') final = 'ur';
  if (final === 'eng') final = 'urng';
  final = final.replace('ê', 'e');
  final = final.replace('ee', 'e');

  if (final.endsWith('n')) final += 'n';
  final = final.replace('ao', 'au');
  if (final.endsWith('nd')) final = final.replace('nd', 'n');
  final = final.replace('b', 'p');
  final = final.replace('d', 't');
  if (!final.endsWith('ng')) final = final.replace('g', 'k');
  return new Pronunciation(initial, final, dpPron.tone);
}

function convertPUJPronunciationToDPPronunciation(pronunciation) {
  let result = new Pronunciation(pronunciation.initial, pronunciation.final, pronunciation.tone);

  const initialMap = PUJ_DP_INITIAL_MAP;

  result.initial = initialMap[result.initial.toLowerCase()] ?? result.initial;

  // 特殊韵母
  result.final = result.final.replace('e', 'ê');
  result.final = result.final.replace(/ir|ur/, 'e');
  result.final = result.final.replace(/or|er/, 'er');
  // result.final = result.final.replace('iau', 'iou');
  result.final = result.final.replace('au', 'ao');
  // 鼻化韵尾
  result.final = result.final.replace(/(?<!n)n$/, 'nd');
  result.final = result.final.replace('nn', 'n');
  // 入声韵尾
  result.final = result.final.replace(/p$/, 'b');
  result.final = result.final.replace(/t$/, 'd');
  result.final = result.final.replace(/k$/, 'g');

  // (v)ng -> eng
  // if (result.initial !== '' && result.initial !== 'h' && result.final.match(/^ng$/i)) {
  //   result.final = 'eng';
  // }

  // 去掉 nn'
  // if (result.final.endsWith("'")) result.final = result.final.substring(0, result.final.length - 1);
  return new Pronunciation(result.initial, result.final, result.tone);
}

function convertPUJToDPSentence(sentence) {
  let result = '';
  forEachWordInSentence(sentence, (cur) => {
    cur = cur.toLowerCase(); // 潮拼的作用只限于标记拼音，一般不用于作为拉丁语形式书写。
    let pronunciation = convertPlainPUJToPronunciationWord(cur);
    if (pronunciation) {
      pronunciation = convertPUJPronunciationToDPPronunciation(pronunciation);
      pronunciation.initial = pronunciation.initial === '' ? '' : pronunciation.initial;
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
  let initial = pronunciation.initial;
  initial = initial.replace("'", "");
  let fq_initial = initial_map[initial];
  if (fq_initial === undefined && fallback_pronunciation) {
    fq_initial = initial_map[fallback_pronunciation.initial];
  }
  if (fq_initial === undefined) {
    fq_initial = initial;
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
  '': '?',
  'p': 'p',
  'pf': 'p_df',
  'ph': 'p_h',
  'phf': 'p_d_hf',
  'm': 'm',
  'mv': 'F',
  'b': 'b',
  'bv': 'b_d',
  'v': 'v',
  't': 't',
  'th': 't_h',
  'n': 'n',
  'l': 'l',
  'k': 'k',
  'kh': 'k_h',
  'ng': 'N',
  'g': 'g',
  'h': 'h',
  'f': 'p\\',
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
  'ur': 'M',
  'ir': 'M',
  'or': '@',
  'er': '@',
  'e': 'e',
  'i': 'i',
  'u': 'u',

  // 'nn': '~',
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
  if (result.final.startsWith('ng')) {
    if (result.initial === 'h' || result.initial === '') {
      result.initial = result.initial === 'h' ? 'N_0' : '?';
      if (result.final === 'ngh') {
        result.final = 'N=?';
      } else {
        result.final = 'N=';
      }
      return result;
    }
  }
  if (result.final === 'm') {
    if (result.initial === 'h' || result.initial === '') {
      result.initial = result.initial === 'h' ? 'N_0' : '?';
      result.final = 'm=';
      return result;
    }
  }
  result.initial = PUJInitialToXSAMPAMap[result.initial] ?? result.initial;
  // We don't mark optionally-nasalized finals.
  result.final = result.final.replace("nn'", '');
  const isNasalized = result.final.endsWith('nn');
  result.final = result.final.replace('nn', '');
  for (const [key, value] of Object.entries(PUJFinalToXSAMPAMap)) {
    result.final = result.final.replace(key, value);
  }
  if (isNasalized) {
    let final = '';
    for (let i = 0; i < result.final.length; i++) {
      let cur = result.final[i];
      final += cur;
      if (cur.match(/[aoM@eiu]/)) {
        final += '~';
      }
    }
    result.final = final;
  }
  return result;
}

function convertXSAMPAToIPAWord(word) {
  for (const x_sampa of XSAMPAList) {
    const ipa = XSAMPAToIPAMap[x_sampa];
    word = word.replaceAll(x_sampa, ipa);
  }
  return word;
}

function convertXSAMPAPronunciationToIPAPronunciation(pronunciation) {
  const result = new Pronunciation(pronunciation.initial, pronunciation.final, pronunciation.tone);
  result.initial = convertXSAMPAToIPAWord(result.initial);
  result.final = convertXSAMPAToIPAWord(result.final);
  return result;
}

function convertPUJPronunciationToIPAPronunciation(pronunciation) {
  return convertXSAMPAPronunciationToIPAPronunciation(
    convertPUJPronunciationToXSAMPAPronunciation(pronunciation));
}

function convertToneValueToToneLetters(tone, isSandhi = false, isNeutral = false) {
  const citation = ['˩', '˨', '˧', '˦', '˥'];
  const sandhi = ['꜖', '꜕', '꜔', '꜓', '꜒'];
  const neutral = ['꜌', '꜋', '꜊', '꜉', '꜈']
  const neutral_reversed = ['꜑', '꜐', '꜏', '꜎', '꜍']
  let table;
  if (!isSandhi)
    table = isNeutral ? neutral : citation;
  else
    table = isNeutral ? neutral_reversed : sandhi;
  let result = [];
  while (tone > 0) {
    let cur = tone % 10;
    tone -= cur;
    tone /= 10;
    if (cur >= 1 && cur <= 5) {
      result.push(table[cur - 1]);
    } else {
      console.log("调值错误：" + tone);
      return '';
    }
  }
  if (result.length === 2 && result[0] === result[1]) {
    // Don't know why Chrome does not merge two same letters. Make Chrome happy.
    result = [result[0]];
  }
  return result.reverse().join('');
}

function getPronunciationCombination(pron) {
  let initial = pron.initial === '0' ? '' : pron.initial;
  let tone = !pron.tone || pron.tone == 0 ? '' : pron.tone;
  return `${initial}${pron.final}${tone}`;
}

export {
  regexpWordOptional,
  regexpWordDp,
  AtomicFuzzyRule,
  FuzzyRulesGroup,
  FuzzyRulesGroup_Dummy,
  forEachWordInSentence,
  convertPUJInitialOrFinalToDP,
  convertPlainPUJToPronunciationWord,
  convertPlainPUJSentenceToPUJSentence,
  convertPlainPUJSentenceToIPASentence, // TODO
  convertPlainPUJSentenceToDPSentence,
  convertPlainPUJSentenceToDisplayPUJInSentence,
  convertDPWordToPronunciation,
  convertDPPronunciationToPUJPronunciation,
  addPUJToneMarkSentence,
  addPUJToneMarkWord,
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  undoAddPUJToneMarkWord,
  convertPUJToDPSentence,
  convertPUJPronunciationToDPPronunciation,
  convertPUJPronunciationToFanQiePronunciation,
  convertXSAMPAToIPAWord,
  convertXSAMPAPronunciationToIPAPronunciation,
  convertPUJPronunciationToXSAMPAPronunciation,
  convertPUJPronunciationToIPAPronunciation,
  convertToneValueToToneLetters,
  getPronunciationCombination,
}
