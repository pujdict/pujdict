<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="d-inline-block" :id="'popup_puj_' + puj">
    <!-- 主按钮 -->
    <a @click="showModal = true"
       class="text-primary card-popup-text"
       style="text-decoration: none;"
    >
      {{ display_puj }}
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
            <template v-for="(pronunciation, key) in getPerAccentsPronunciations(puj)" :key="key">
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
} from "./QCommon.vue";
import {
  forEachWordInSentence,
  convertPlainPUJSentenceToPUJSentence,
  convertPlainPUJSentenceToDPSentence,
  convertPlainPUJToPronunciationWord,
} from "./SPuj.js";
import {Pronunciation} from "./SCommon.js";

export default {
  props: {
    entries: {
      type: Array,
      default: null,
    },
    puj: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showModal: false,
      result: '',
      display_puj: '',
      display_dp: '',
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
      this.display_puj = convertPlainPUJSentenceToPUJSentence(this.puj);
      this.display_dp = convertPlainPUJSentenceToDPSentence(this.puj);
    },
    getPerAccentsPronunciations() {
      let pronunciations = {};
      Object.entries(getAccentsRules()).forEach(([key, rule]) => {
        let display_puj = '';
        let display_dp = '';
        let iWord = 0;
        forEachWordInSentence(this.puj, (word: string) => {
          let pron: Pronunciation = convertPlainPUJToPronunciationWord(word);
          if (iWord < this.entries.length && this.entries[iWord]) {
            pron = getFuzzyPronunciation(key, this.entries[iWord]);
          } else {
            pron = rule.fuzzy(pron);
          }
          display_puj += convertPlainPUJSentenceToPUJSentence(`${pron.initial}${pron.final}${pron.tone}`);
          display_dp += convertPlainPUJSentenceToDPSentence(`${pron.initial}${pron.final}${pron.tone}`);
          iWord++;
        }, (nonWord: string) => {
          if (nonWord == '--') nonWord = '·';
          display_puj += nonWord;
          display_dp += nonWord;
        });
        pronunciations[key] = {
          key: key,
          name: rule.name,
          display_puj: display_puj,
          display_dp: display_dp,
        };
      });
      return pronunciations;
    },
  }
};
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>

<style>
.card-popup-text {
  cursor: pointer;
  padding: 0 3px;
}
.card-popup-text:hover {
  opacity: 0.7;
}
</style>
