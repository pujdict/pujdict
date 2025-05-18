<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form onsubmit="return false;">
      <div class="row g-2">
        <div class="form-group">
          <label for="convert-input">输入需要转换的文字：</label>
          <textarea class="form-control" id="convert-input" rows="3"
                    v-model="convertInput"></textarea>
        </div>
        <div class="mb-3">
           <span
               v-for="(pinyinObj, index) in pinyinList"
               :key="index"
               class="pinyin-item">
            <template v-if="pinyinObj.isPolyphonic">
              <div class="dropdown d-inline">
                <span
                    class="text-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    style="cursor: pointer;"
                >
                  {{ pinyinObj.currentPUJ }}
                </span>
                <ul class="dropdown-menu">
                  <li
                      v-for="(py, idx) in pinyinObj.possiblePUJs"
                      :key="idx"
                      @click="selectPinyin(index, idx)"
                  >
                    <a class="dropdown-item" href="#">{{ py }}</a>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else>
              {{ pinyinObj.currentPUJ }}
            </template>
                 <!-- 添加空格分隔 -->
            <template v-if="index < pinyinList.length - 1">&nbsp;</template>
          </span>
        </div>
        <div class="form-group">
          <label for="convert-result">转换结果：</label>
          <textarea class="form-control" id="convert-result" rows="3" readonly
                    v-model="finalPUJ"></textarea>
        </div>
        <div class="btn-toolbar">
          <div class="btn-group">
            <input id="query-button" class="btn btn-outline-primary" type="submit" value="转换" @click="convertAction"/>
            <input id="reset-button" class="btn btn-outline-danger" type="button" value="重置" @click="resetAction"/>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
</script>
<script>
import {
  addPUJToneMarkAndConvertToDisplayPUJSentence,
  addPUJToneMarkWord,
  convertPUJToDPSentence,
} from "./SPuj.js";
import {
  Entry, Pronunciation,
  makeEntryFromJson, makeEntryFromSqlResult,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  // $,
  db, combinations,
} from './QCommon.vue';

import jquery from 'jquery';
import {isChineseChar} from "./SUtils.js";

const $ = jquery;

function getHanCharPUJ(han) {
  let cmd = `SELECT * FROM entries WHERE entries.char = '${han}' or entries.char_sim = '${han}' ORDER BY entries.freq, entries.cat`;
  let result = db.exec(cmd);
  if (result.length === 0)
    return [];
  result = result[0].values;
  let entries = new Set();
  for (let i = 0; i < result.length; i++) {
    const entry = makeEntryFromSqlResult(result[i]);
    entries.add(addPUJToneMarkAndConvertToDisplayPUJSentence(entry.combination));
  }
  return [...entries];
}

export default {
  data() {
    return {
      inputText: '',
      convertInput: '',
      convertOutput: '',
      pinyinList: [],
    }
  },
  computed: {
    finalPUJ() {
      return this.pinyinList.map(p => p.currentPUJ).join(' ');
    }
  },
  methods: {
    convertAction() {
      try {
        this.convertToPinyin(this.convertInput);
      } catch (e) {
        alert(`发生错误：${e}`);
      }
    },
    resetAction() {
      this.convertInput = '';
    },
    convertToPinyin(text) {
      this.pinyinList = [...text].map(char => {
        const pujs = getHanCharPUJ(char);
        return {
          char,
          possiblePUJs: pujs,
          currentPUJ: pujs.length ? pujs[0] : '',
          isPolyphonic: pujs.length > 1
        }
      })
    },
    selectPinyin(index, pinyinIndex) {
      this.pinyinList[index].currentPUJ =
          this.pinyinList[index].possiblePUJs[pinyinIndex]
      this.$forceUpdate() // 确保视图更新
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import('bootstrap');
    }
    $("#reset-button").click(function () {
      this.blur();
    });
    $("#query-button").click(function () {
      this.blur();
    });
    initFromDatabase().then(() => {
      setLoading(false);
    });
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>