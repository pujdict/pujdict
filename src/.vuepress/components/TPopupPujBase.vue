<script lang="ts">
import {
  getAccentsRules, getFuzzyPronunciation,
  getCharEntryOfPronunciation,
} from "./QCommon.vue";
import {
  forEachWordInSentence,
  convertPlainPUJSentenceToPUJSentence,
  convertPlainPUJSentenceToDPSentence,
  convertPlainPUJSentenceToIPASentence,
  convertPlainPUJToPronunciationWord, getPronunciationCombination,
} from "./SPuj.js";
import {Pronunciation} from "./SCommon.js";
import {getLocalOption} from "./SUtils.js";
import {pujpb} from "./SPujPb";
import {h} from "vue";

export default {
  name: "TPopupPujBase",
  components: {
    PinyinTag: {
      props: {
        type: {
          type: String,
          required: true,
          validator: value => ['PUJ', 'DP'].includes(value),
        }
      },
      render() {
        return h('sup', {
          style: 'color: steelblue; font-size: 0.5em; user-select: none;',
        }, this.type);
      },
    }
  },
  props: {
    charsList: {
      type: Array,
      default: [],
    },
    puj: {
      type: String,
      required: true
    },
    noAccent: {
      type: Boolean,
      default: false,
    },
    additionalStyle: {
      type: Object,
      required: false,
      default: {},
    },
  },
  data() {
    return {
      showModal: false,
      result: '',
      display_puj: '',
      display_dp: '',
      display_ipa: '',
      display: '',
      perAccentsResult: {},
    };
  },
  created() {
    this.updateDisplay();
  },
  updated() {
    this.updateDisplay();
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
    this.updateDisplay();
  },
  computed: {
    customDefaultPinyinDisplay() {
      return getLocalOption('custom-default-pinyin-display').split(';');
    },
    showPUJ() {
      return this.customDefaultPinyinDisplay.includes('PUJ');
    },
    showDP() {
      return this.customDefaultPinyinDisplay.includes('DP');
    },
    showIPA() {
      return this.customDefaultPinyinDisplay.includes('IPA');
    }
  },
  methods: {
    updateDisplay() {
      const defaultFuzzyRule = getLocalOption("custom-default-pinyin-display-fuzzy-rule");
      if (defaultFuzzyRule === 'dummy' || this.noAccent) {
        this.display_puj = convertPlainPUJSentenceToPUJSentence(this.puj);
        this.display_dp = convertPlainPUJSentenceToDPSentence(this.puj);
        this.display_ipa = convertPlainPUJSentenceToIPASentence(this.puj);
      } else {
        const result = this.generateAccentPronunciation(defaultFuzzyRule);
        this.display_puj = result.display_puj;
        this.display_dp = result.display_dp;
        this.display_ipa = convertPlainPUJSentenceToIPASentence(this.puj);
      }
    },
    generatePerAccentsPronunciations() {
      const customListedPinyinDisplayFuzzyRulesStr = getLocalOption('custom-listed-pinyin-display-fuzzy-rules');
      const customListedPinyinDisplayFuzzyRules = customListedPinyinDisplayFuzzyRulesStr.split(';');
      Object.entries(getAccentsRules()).forEach(([key, rule]) => {
        if (customListedPinyinDisplayFuzzyRulesStr !== '' && !customListedPinyinDisplayFuzzyRules.includes(key)) return;
        this.generateAccentPronunciation(key);
      });
      return this.perAccentsResult;
    },
    generateAccentPronunciation(accentKey: string) {
      if (this.perAccentsResult[accentKey]) return this.perAccentsResult[accentKey];
      const accentRule = getAccentsRules()[accentKey];
      if (!accentRule) console.error(`Accent rule ${accentKey} not found`)
      let display_puj = '';
      let display_dp = '';
      let iWord = 0;
      forEachWordInSentence(this.puj, (word: string) => {
        let pron: Pronunciation = convertPlainPUJToPronunciationWord(word);

        let fuzzyPron = accentRule.fuzzy(pron);
        let curPuj = convertPlainPUJSentenceToPUJSentence(getPronunciationCombination(fuzzyPron));
        let curDp = convertPlainPUJSentenceToDPSentence(getPronunciationCombination(fuzzyPron));

        // TODO: 重构
        L_trySearchForAka:
            for (let i = 0; i < this.charsList.length; i++) {
              const possibleChars = this.charsList[i];
              if (possibleChars.length <= iWord) continue;
              for (let j = 0; j < possibleChars.length; j++) {
                const possibleChar = possibleChars[j];
                const entry = getCharEntryOfPronunciation(possibleChar, pron);
                if (entry) {
                  if (accentKey !== 'dummy' && entry.pron.final.endsWith("nn'")) {
                    let nasalizedPron = new Pronunciation(fuzzyPron.initial, fuzzyPron.final.replace("nn'", 'nn'), fuzzyPron.tone);
                    // 潮普小片 oinn -> ainn，例如“第”，但反之不成立，潮汕小片 ainn -/> oinn，例如“爱”
                    nasalizedPron = accentRule.fuzzy(nasalizedPron);
                    let denasalizedPron = new Pronunciation(fuzzyPron.initial, fuzzyPron.final.replace("nn'", ''), fuzzyPron.tone);
                    denasalizedPron = accentRule.fuzzy(denasalizedPron);
                    curPuj = convertPlainPUJSentenceToPUJSentence(getPronunciationCombination(denasalizedPron));
                    curPuj += `(${convertPlainPUJSentenceToPUJSentence(getPronunciationCombination(nasalizedPron))})`;
                    curDp = convertPlainPUJSentenceToDPSentence(getPronunciationCombination(denasalizedPron));
                    curDp += `(${convertPlainPUJSentenceToDPSentence(getPronunciationCombination(nasalizedPron))})`;
                  }
                  for (const pronAka of entry.pronAka) {
                    if (pronAka.accentId === accentKey) {
                      let akaPuj = [];
                      let akaDp = [];
                      for (const pron of pronAka.prons) {
                        akaPuj.push(convertPlainPUJSentenceToPUJSentence(getPronunciationCombination(pron)));
                        akaDp.push(convertPlainPUJSentenceToDPSentence(getPronunciationCombination(pron)));
                      }
                      if (pronAka.replace) {
                        curPuj = akaPuj[0];
                        curDp = akaDp[0];
                        akaPuj.shift();
                        akaDp.shift();
                      }
                      let akaPujStr = akaPuj.join('/');
                      let akaDpStr = akaDp.join('/');
                      curPuj += `(${akaPujStr})`;
                      curDp += `(${akaDpStr})`;
                      break L_trySearchForAka;
                    }
                  }
                }
              }
            }
        display_puj += curPuj;
        display_dp += curDp;
        iWord++;
      }, (nonWord: string) => {
        if (nonWord == '--') nonWord = '·';
        display_puj += nonWord;
        display_dp += nonWord;
      });
      return this.perAccentsResult[accentKey] = {
        key: accentKey,
        name: accentRule.name,
        display_puj: display_puj,
        display_dp: display_dp,
      };
    },
  },
};
</script>