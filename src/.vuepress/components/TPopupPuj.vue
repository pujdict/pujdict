<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="d-inline-block" :id="'popup_puj_' + puj">
    <!-- 主按钮 -->
    <a @click="showModal = true"
       class="text-primary card-popup-text"
       style="text-decoration: none;"
       :style="additionalStyle"
    >
      {{ display }}
    </a>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" @click.self="showModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content detail-card fade-in">
          <div class="modal-header">
            <h5 class="modal-title">读音详细</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <template v-for="(pronunciation, key) in generatePerAccentsPronunciations(puj)" :key="key">
              <template v-if="key !== 'dummy'">
                <div class="d-flex align-items-baseline my-2">
                  <span class="badge border border-primary text-primary me-2">{{ pronunciation.name }}</span>
                  <div class="d-flex flex-column">
                    <template v-if="key !== 'custom'">
                      <span>{{ pronunciation.display_puj }}</span>
                      <span>{{ pronunciation.display_dp }}</span>
                    </template>
                  </div>
                </div>
              </template>
            </template>
          </div>
          <!-- 备用
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">关闭</button>
            <button type="button" class="btn btn-primary">保存更改</button>
          </div>
          -->
        </div>
      </div>
    </div>

    <!-- 模态框背景 -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
</script>

<script lang="ts">
import {
  getAccentsRules, getFuzzyPronunciation,
  getCharEntryOfPronunciation,
} from "./QCommon.vue";
import {
  FuzzyRuleBase,
  forEachWordInSentence,
  convertPlainPUJSentenceToPUJSentence,
  convertPlainPUJSentenceToDPSentence,
  convertPlainPUJToPronunciationWord,
} from "./SPuj.js";
import {Pronunciation} from "./SCommon.js";
import {getLocalOption} from "./SUtils";
import {pujpb} from "./SPujPb";

export default {
  props: {
    // 此参数为二维列表，也就是 Array<Array<Char>>
    // Char 为字符串类型的单个汉字
    // 这个列表用于针对某种口音的又音字进行转换。
    charsList: {
      type: Array,
      default: [],
    },
    puj: {
      type: String,
      required: true
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
  },
  methods: {
    updateDisplay() {
      const defaultFuzzyRule = getLocalOption("custom-default-pinyin-display-fuzzy-rule");
      if (defaultFuzzyRule === 'dummy') {
        this.display_puj = convertPlainPUJSentenceToPUJSentence(this.puj);
        this.display_dp = convertPlainPUJSentenceToDPSentence(this.puj);
      } else {
        const result = this.generateAccentPronunciation(defaultFuzzyRule);
        this.display_puj = result.display_puj;
        this.display_dp = result.display_dp;
      }
      const customDefaultPinyinDisplay = getLocalOption('custom-default-pinyin-display').split(';');
      const displayList = [];
      if (customDefaultPinyinDisplay.includes('PUJ')) {
        displayList.push(this.display_puj);
      }
      if (customDefaultPinyinDisplay.includes('DP')) {
        displayList.push(this.display_dp);
      }
      this.display = displayList.join('/');
    },
    generatePerAccentsPronunciations() {
      Object.entries(getAccentsRules()).forEach(([key, rule]) => {
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
        let curPuj = convertPlainPUJSentenceToPUJSentence(`${fuzzyPron.initial}${fuzzyPron.final}${fuzzyPron.tone}`);
        let curDp = convertPlainPUJSentenceToDPSentence(`${fuzzyPron.initial}${fuzzyPron.final}${fuzzyPron.tone}`);

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
                curPuj = convertPlainPUJSentenceToPUJSentence(`${denasalizedPron.initial}${denasalizedPron.final}${denasalizedPron.tone}`);
                curPuj += `(${convertPlainPUJSentenceToPUJSentence(`${nasalizedPron.initial}${nasalizedPron.final}${nasalizedPron.tone}`)})`;
                curDp = convertPlainPUJSentenceToDPSentence(`${denasalizedPron.initial}${denasalizedPron.final}${denasalizedPron.tone}`);
                curDp += `(${convertPlainPUJSentenceToDPSentence(`${nasalizedPron.initial}${nasalizedPron.final}${nasalizedPron.tone}`)})`;
              }
              for (const pronAka of entry.pronAka) {
                if (pronAka.accentId === accentKey) {
                  let akaPuj = [];
                  let akaDp = [];
                  for (const pron of pronAka.prons) {
                    akaPuj.push(convertPlainPUJSentenceToPUJSentence(`${pron.initial}${pron.final}${pron.tone}`));
                    akaDp.push(convertPlainPUJSentenceToDPSentence(`${pron.initial}${pron.final}${pron.tone}`));
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
  }
};
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
[data-bs-theme="dark"] {
  //--bs-primary: rgb(0, 150, 255);
  --bs-primary-rgb: 120, 190, 255;
  //--bs-primary-bg-subtle: rgb(0, 200, 255);
  //--bs-primary-bg-subtle-dark: rgb(0, 200, 255);

  //.btn-primary {
  //  --bs-btn-bg: rgb(0, 200, 255);
  //}
}
</style>

<style>
.card-popup-text {
  cursor: pointer;
}
.card-popup-text:hover {
  opacity: 0.7;
}
</style>
