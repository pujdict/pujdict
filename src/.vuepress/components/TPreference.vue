<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form @submit.prevent="saveAction">
      <div class="row">
        <fieldset class="form-group mb-2">
          <legend class="col-form-label">
            默认拼音显示方式
            <span v-if="!isCustomDefaultPinyinDisplayValid()" class="text-danger"> (*请至少选中一项)</span>
          </legend>
          <div class="form-check-inline" v-for="defaultPinyinDisplay in defaultPinyinDisplays">
            <div class="form-check">
              <input class="form-check-input"
                     name="default-pinyin-display"
                     type="checkbox"
                     :disabled="defaultPinyinDisplay.value === 'IPA'"
                     :id="`default-pinyin-display-${defaultPinyinDisplay.value}`"
                     :value="defaultPinyinDisplay.value"
                     v-model="customDefaultPinyinDisplay"
                     @change="onFormChanged"/>
              <label class="form-check-label" :for="`default-pinyin-display-${defaultPinyinDisplay.value}`">
                {{ defaultPinyinDisplay.name }}
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group mb-2">
          <legend class="col-form-label">白话字第六声调符</legend>
          <div class="form-check-inline" v-for="toneMark in toneMarks6">
            <div class="form-check">
              <input class="form-check-input"
                     type="radio"
                     name="tone-mark-6"
                     :id="`tone-mark-6-${toneMark.value}`"
                     :value="toneMark.value"
                     v-model="customToneMark6"
                     @change="onFormChanged"/>
              <label class="form-check-label" :for="`tone-mark-6-${toneMark.value}`">
                {{ toneMark.name }}
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group mb-2">
          <legend class="col-form-label">白话字第八声调符</legend>
          <div class="form-check-inline" v-for="toneMark in toneMarks8">
            <div class="form-check">
              <input class="form-check-input"
                     type="radio"
                     name="tone-mark-8"
                     :id="`tone-mark-8-${toneMark.value}`"
                     :value="toneMark.value"
                     v-model="customToneMark8"
                     @change="onFormChanged"/>
              <label class="form-check-label" :for="`tone-mark-8-${toneMark.value}`">
                {{ toneMark.name }}
              </label>
            </div>
          </div>
        </fieldset>

        <div class="btn-toolbar">
          <div class="btn-group">
            <input id="query-button" class="btn btn-outline-primary" type="submit" value="保存"
                   :disabled="!canSave()"/>
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
import {DefaultLocalOptions} from "./SUtils";

export default {
  data() {
    return {
      formChanged: false,
      availableFuzzyRules: [],
      customPUJFuzzyRules: [],
      defaultPinyinDisplays: [
        {value: "PUJ", name: "白话字"},
        {value: "DP", name: "潮拼"},
        {value: "IPA", name: "国际音标"},
      ],
      customDefaultPinyinDisplay: DefaultLocalOptions['custom-default-pinyin-display'].split(';'),
      toneMarks6: [
        {value: "\u0303", name: '波浪符 ◌̃'},
        {value: "\u0306", name: '短音符 ◌̆'},
        {value: "\u030C", name: '抑扬符 ◌̌'},
      ],
      customToneMark6: DefaultLocalOptions['custom-tone-mark-6'],
      toneMarks8: [
        {value: "\u0301", name: '锐音符 ◌́'},
        {value: "\u030D", name: '竖线符 ◌̍'},
        {value: "\u0302", name: '扬抑符 ◌̂'},
      ],
      customToneMark8: DefaultLocalOptions['custom-tone-mark-8'],
    }
  },
  methods: {
    isCustomDefaultPinyinDisplayValid() {
      return this.customDefaultPinyinDisplay.length > 0;
    },
    canSave() {
      return this.formChanged
          && this.isCustomDefaultPinyinDisplayValid()
          ;
    },
    onFormChanged() {
      this.formChanged = true;
    },
    saveAction() {
      this.formChanged = false;
      // let customPujFuzzyRules = this.customPUJFuzzyRules.join(';');
      // setLocalOption('custom-puj-fuzzy-rules', customPujFuzzyRules);
      let customDefaultPinyinDisplay = this.customDefaultPinyinDisplay.join(';');
      setLocalOption('custom-default-pinyin-display', customDefaultPinyinDisplay);
      setLocalOption('custom-tone-mark-6', this.customToneMark6);
      setLocalOption('custom-tone-mark-8', this.customToneMark8);
    },
  },
  mounted() {
    // let customPujFuzzyRules = getLocalOption('custom-puj-fuzzy-rules', '');
    // this.customPUJFuzzyRules = customPujFuzzyRules.split(';');
    const customDefaultPinyinDisplay = getLocalOption('custom-default-pinyin-display');
    this.customDefaultPinyinDisplay = customDefaultPinyinDisplay.split(';');
    this.customToneMark6 = getLocalOption('custom-tone-mark-6');
    this.customToneMark8 = getLocalOption('custom-tone-mark-8');
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

.form-check * {
  /* add hover mouse icon */
  cursor: pointer;
}

</style>