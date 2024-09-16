<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form onsubmit="return false;">
      <div class="row g-2">
        <div class="form-group">
          <label for="custom-puj-fuzzy-rule-input">自定义白话字口音规则：</label>
          <textarea class="form-control" id="custom-puj-fuzzy-rule" rows="8"
                    v-model="customPUJFuzzyRule"
                    :placeholder="defaultCustomPUJFuzzyRule"></textarea>
        </div>
        <div class="btn-toolbar">
          <div class="btn-group">
            <input id="query-button" class="btn btn-outline-primary" type="submit" value="保存" @click="saveAction"/>
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
  setLocalOption,
  getLocalOption,
} from "./QCommon.vue";

export default {
  data() {
    const defaultCustomPUJFuzzyRule = `(puj) => {
  let result = new Pronunciation(puj.initial, puj.final, puj.tone);
  // 请在此处编写自定义规则，可修改其中的 initial final tone 变量
  // if (result.final === 'io') result.final = 'ie';
  return result;
}
`;
    return {
      defaultCustomPUJFuzzyRule: defaultCustomPUJFuzzyRule,
      customPUJFuzzyRule: defaultCustomPUJFuzzyRule,
    }
  },
  methods: {
    saveAction() {
      setLocalOption('custom-puj-fuzzy-rule', this.customPUJFuzzyRule);
    },
  },
  mounted() {
    this.customPUJFuzzyRule = getLocalOption('custom-puj-fuzzy-rule', this.defaultCustomPUJFuzzyRule);
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>

<style>

#custom-puj-fuzzy-rule {
  font-family: NotoSansMono, SourceHanSans, monospace;
  font-size-adjust: 0.5;
  line-height: normal;
}

</style>