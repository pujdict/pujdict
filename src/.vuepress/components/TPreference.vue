<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <form @submit.prevent="saveAction">
      <div class="row">
        <fieldset class="form-group mb-2">
          <legend class="col-form-label">
            <b>默认拼音显示方式</b>
            <span v-if="!isCustomDefaultPinyinDisplayValid()" class="text-danger"> (*请至少选中一项)</span>
          </legend>
          <div class="form-check-inline" v-for="defaultPinyinDisplay in defaultPinyinDisplays">
            <div class="form-check">
              <input class="form-check-input"
                     name="default-pinyin-display"
                     type="checkbox"
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

        <fieldset>
          <legend class="col-form-label"><b>默认拼音口音规则</b></legend>
          <div class="form-check-inline" v-for="defaultPinyinDisplayFuzzyRule in defaultPinyinDisplayFuzzyRules">
            <div class="form-check">
              <input class="form-check-input"
                     name="default-pinyin-display"
                     type="radio"
                     :id="`default-pinyin-display-${defaultPinyinDisplayFuzzyRule.value}`"
                     :value="defaultPinyinDisplayFuzzyRule.value"
                     v-model="customDefaultPinyinDisplayFuzzyRule"
                     @change="onFormChanged"/>
              <label class="form-check-label" style="width: 4em" :for="`default-pinyin-display-${defaultPinyinDisplayFuzzyRule.value}`">
                {{ defaultPinyinDisplayFuzzyRule.name }}
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend class="col-form-label"><b>拼音详情页展示口音</b></legend>
          <div class="form-check-inline" v-for="listedPinyinDisplayFuzzyRule in listedPinyinDisplayFuzzyRules">
            <div class="form-check">
              <input class="form-check-input"
                     name="listed-pinyin-display"
                     type="checkbox"
                     :id="`listed-pinyin-display-${listedPinyinDisplayFuzzyRule.value}`"
                     :value="listedPinyinDisplayFuzzyRule.value"
                     v-model="customListedPinyinDisplayFuzzyRules"
                     @change="onFormChanged"/>
              <label class="form-check-label" style="width: 4em" :for="`listed-pinyin-display-${listedPinyinDisplayFuzzyRule.value}`">
                {{ listedPinyinDisplayFuzzyRule.name }}
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group mb-2">
          <legend class="col-form-label"><b>白话字第六声调符</b></legend>
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
          <legend class="col-form-label"><b>白话字第八声调符</b></legend>
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

        <fieldset class="form-group mb-2">
          <legend class="col-form-label"><b>定制口音</b></legend>
          <div class="d-flex align-items-center">
            <label class="col-sm-auto">导入口音预设：</label>
            <select class="form-select form-select-sm" style="width: auto;" v-model="customAccentProto" @change="onCustomAccentProtoChanged">
              <template v-for="availableAccent in availableProtoAccents">
                <option :id="availableAccent.value" :value="availableAccent.value">
                  {{ availableAccent.name }}
                </option>
              </template>
            </select>
          </div>
          <div class="form-check" v-for="rule in availableFuzzyRules">
            <div>
              <input class="form-check-input"
                     type="checkbox"
                     :id="`custom-accent-1-${rule.id}`"
                     :value="rule.id"
                     v-model="customAccent1Rules"
                     @change="onAvailableFuzzyRuleChanged"/>
              <label class="form-check-label" :for="`custom-accent-1-${rule.id}`" v-html="rule.desc">
              </label>
            </div>
          </div>
        </fieldset>

        <hr/>

        <div class="btn-toolbar">
          <div class="btn-group">
            <input id="query-button" class="btn btn-outline-primary" type="submit" value="保存"
                   :disabled="!canSave()"/>
          </div>
          <img id="loading" :src="withBase('/loading.svg')" height="35" width="35" alt="加载中"/>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
import {withBase} from "vuepress/client";
</script>

<script lang="ts">
import {
  setLoading,
  initFromDatabase,
  getAccentsRules,
  db,
} from "./QCommon.vue";
import {
  setLocalOption,
  setLocalOptionList,
  getLocalOption,
  getLocalOptionList,
} from "./SUtils";
import {createVNode, render} from "vue";
import TPopupPujNoAccent from "./TPopupPujNoAccent.vue";

export default {
  data() {
    return {
      formChanged: false,
      availableFuzzyRules: [],
      customPUJFuzzyRules: [],
      defaultPinyinDisplays: [
        {value: "PUJ", name: "白话字"},
        {value: "DP", name: "潮拼"},
        {value: "IPA", name: "国际音标 (Beta)"},
      ],
      customDefaultPinyinDisplay: getLocalOptionList('custom-default-pinyin-display'),
      defaultPinyinDisplayFuzzyRules: [
        {value: "dummy", name: "辞典"},
      ],
      customDefaultPinyinDisplayFuzzyRule: getLocalOption('custom-default-pinyin-display-fuzzy-rule'),
      listedPinyinDisplayFuzzyRules: [
        {value: "dummy", name: "辞典"},
      ],
      customListedPinyinDisplayFuzzyRules: getLocalOptionList('custom-listed-pinyin-display-fuzzy-rules'),
      toneMarks6: [
        {value: "\u0303", name: '波浪符 ◌̃'},
        {value: "\u0306", name: '短音符 ◌̆'},
        {value: "\u030C", name: '抑扬符 ◌̌'},
      ],
      customToneMark6: getLocalOption('custom-tone-mark-6'),
      toneMarks8: [
        {value: "\u0301", name: '锐音符 ◌́'},
        {value: "\u030D", name: '竖线符 ◌̍'},
        {value: "\u0302", name: '扬抑符 ◌̂'},
      ],
      customToneMark8: getLocalOption('custom-tone-mark-8'),
      customAccentProto: 'dummy',
      availableProtoAccents: [
        {value: "", name: ""},
      ],
      availableAccentRules: [
        // {value: "rule1", name: "规则1"},
      ],
      customAccent1Rules: getLocalOptionList('custom-accent-1-rules'),
    }
  },
  methods: {
    makeFuzzyRuleDesc(desc: string, examples: string[]) {
      if (!desc) return '';
      let result = desc;
      // regex find all text of {text}
      const matcher = /\{([^\}]+)\}/g;
      const matches = desc.matchAll(matcher);
      for (const match of matches) {
        const fullMatch = match[0];
        const content = match[1] + '0';
        const replacement = `<span data-fuzzy-desc-puj="${content}"></span>`;
        result = result.replace(fullMatch, replacement);
      }
      const examplesHtml = `<span>[例: ${examples.join(', ')}] </span>`
      return examplesHtml + result;
    },
    renderFuzzyRuleDesc() {
      const elements = document.querySelectorAll('[data-fuzzy-desc-puj]');
      for (const element of elements) {
        const content = element.getAttribute('data-fuzzy-desc-puj');
        const vNode = createVNode(TPopupPujNoAccent, {puj: content});
        const span = document.createElement('span');
        render(vNode, span);
        element.replaceWith(span);
      }
    },
    isCustomDefaultPinyinDisplayValid() {
      return this.customDefaultPinyinDisplay.length > 0;
    },
    canSave() {
      return this.formChanged
          && this.isCustomDefaultPinyinDisplayValid()
          ;
    },
    onAvailableFuzzyRuleChanged() {
      this.onFormChanged();
      this.customAccentProto = '';
    },
    onFormChanged() {
      this.formChanged = true;
    },
    onCustomAccentProtoChanged() {
      if (this.customAccentProto === 'dummy') {
        this.customAccent1Rules = [];
        return;
      }
      for (let accent of db.accents) {
        if (accent.id === this.customAccentProto) {
          this.customAccent1Rules = [];
          for (let ruleIndex of accent.rules) {
            this.customAccent1Rules.push(db.fuzzyRuleDescriptors[ruleIndex].id);
          }
        }
      }
    },
    saveAction() {
      this.formChanged = false;
      // let customPujFuzzyRules = this.customPUJFuzzyRules.join(';');
      // setLocalOption('custom-puj-fuzzy-rules', customPujFuzzyRules);
      setLocalOptionList('custom-default-pinyin-display', this.customDefaultPinyinDisplay);
      setLocalOption('custom-default-pinyin-display-fuzzy-rule', this.customDefaultPinyinDisplayFuzzyRule);
      setLocalOptionList('custom-listed-pinyin-display-fuzzy-rules', this.customListedPinyinDisplayFuzzyRules);
      setLocalOption('custom-tone-mark-6', this.customToneMark6);
      setLocalOption('custom-tone-mark-8', this.customToneMark8);
      setLocalOptionList('custom-accent-1-rules', this.customAccent1Rules);
    },
  },
  mounted() {
    // let customPujFuzzyRules = getLocalOption('custom-puj-fuzzy-rules', '');
    // this.customPUJFuzzyRules = customPujFuzzyRules.split(';');
    const customDefaultPinyinDisplay = getLocalOption('custom-default-pinyin-display');
    this.customDefaultPinyinDisplay = customDefaultPinyinDisplay.split(';');
    this.customDefaultPinyinDisplayFuzzyRule = getLocalOption('custom-default-pinyin-display-fuzzy-rule');
    const customListedPinyinDisplayFuzzyRules = getLocalOption('custom-listed-pinyin-display-fuzzy-rules');
    this.customListedPinyinDisplayFuzzyRules = customListedPinyinDisplayFuzzyRules.split(';');
    this.customToneMark6 = getLocalOption('custom-tone-mark-6');
    this.customToneMark8 = getLocalOption('custom-tone-mark-8');
    initFromDatabase().then(() => {
      this.availableFuzzyRules = db.fuzzyRuleDescriptors.map(fuzzyRuleDescriptor => {
        return {
          id: fuzzyRuleDescriptor.id,
          desc: this.makeFuzzyRuleDesc(fuzzyRuleDescriptor.desc, fuzzyRuleDescriptor.examples),
        };
      });
      setLoading(false);
      this.defaultPinyinDisplayFuzzyRules = [];
      this.listedPinyinDisplayFuzzyRules = [];
      this.availableProtoAccents = [
        {value: "", name: ""},
      ];
      for (const [key, rule] of Object.entries(getAccentsRules())) {
        if (!key.startsWith('custom'))
          this.availableProtoAccents.push({
            value: key,
            name: rule.name,
          });
        this.defaultPinyinDisplayFuzzyRules.push({
          value: key,
          name: rule.name,
        });
        this.listedPinyinDisplayFuzzyRules.push({
          value: key,
          name: rule.name,
        })
      }
      if (!customListedPinyinDisplayFuzzyRules || customListedPinyinDisplayFuzzyRules === '') {
        this.customListedPinyinDisplayFuzzyRules = this.listedPinyinDisplayFuzzyRules.map(rule => rule.value);
      }
    });
  },
  updated() {
    this.renderFuzzyRuleDesc();
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