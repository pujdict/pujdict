<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="d-inline-block" :id="'popup_puj_' + puj">
    <span :style="additionalStyle">
      <template v-if="showPUJ">{{ display_puj }}<PinyinTag v-if="showDP && showPUJ" type="PUJ"/></template>
      <span v-if="showDP && showPUJ" style="opacity: 60%">/</span>
      <template v-if="showDP">{{ display_dp }}<PinyinTag v-if="showDP && showPUJ" type="DP"/></template>
    </span>
  </div>
</template>

<script setup>
import {darkThemeString} from "./QDarkTheme.vue";
</script>
<script>
import TPopupPujBase from "./TPopupPujBase.vue";
import {darkThemeString} from "./QDarkTheme.vue";
import TDarkTheme from "./TDarkTheme.vue";
import {getLocalOption} from "./SUtils";
import {convertPlainPUJSentenceToDPSentence, convertPlainPUJSentenceToPUJSentence} from "./SPuj";

export default {
  name: "TPopupPujNoAccent",
  extends: TPopupPujBase,
  components: {
    TDarkTheme,
  },
  methods: {
    updateDisplay() {
      this.display_puj = convertPlainPUJSentenceToPUJSentence(this.puj);
      this.display_dp = convertPlainPUJSentenceToDPSentence(this.puj);
    },
  }
};
</script>