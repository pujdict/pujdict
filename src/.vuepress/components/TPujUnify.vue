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
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="use-vr-char" v-model="useVRChar"/>
          <label class="form-check-label" for="use-vr-char">将 v r 转换为 ṳ o̤</label>
        </div>
        <div class="form-group">
          <label for="convert-result">转换结果：</label>
          <textarea class="form-control" id="convert-result" rows="3" readonly
                    v-model="convertOutput"></textarea>
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
} from "./SPuj.js";

export default {
  data() {
    return {
      convertInput: '',
      convertOutput: '',
      useVRChar: true,
    }
  },
  methods: {
    convertAction() {
      try {
        this.convertOutput = addPUJToneMarkAndConvertToDisplayPUJSentence(this.convertInput, !this.useVRChar);
      } catch (e) {
        alert(`发生错误：${e}`);
      }
    },
    resetAction() {
      this.convertInput = '';
    },
  },
  mounted() {
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>