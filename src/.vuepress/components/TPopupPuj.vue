<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString" class="d-inline-block" :id="'popup_puj_' + puj">
    <a @click="showModal = true"
       class="text-primary card-popup-text"
       style="text-decoration: none;"
       :style="additionalStyle"
    >
      <template v-if="showPUJ">{{ display_puj }}<PinyinTag v-if="showDP && showPUJ" type="PUJ"/></template>
      <span v-if="showDP && showPUJ" style="opacity: 60%">
        <template v-if="linebreak"><br/></template><template v-else>/</template>
      </span>
      <template v-if="showDP">{{ display_dp }}<PinyinTag v-if="showDP && showPUJ" type="DP"/></template>
      <template v-if="showIPA && display_ipa !== ''">
        <template v-if="linebreak"><br/>
        [{{ display_ipa }}]
        </template>
      </template>
    </a>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" @click.self="showModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content detail-card fade-in">
          <div class="modal-header">
            <h5 class="modal-title">读音详情</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <template v-for="(pronunciation, key) in generatePerAccentsPronunciations()" :key="key">
              <div class="d-flex align-items-baseline my-2 pronunciation-row">
                <span class="badge border border-primary text-primary pronunciation-badge">{{ pronunciation.name }}</span>
                <div class="d-flex flex-column pronunciation-prons">
                  <span>{{ pronunciation.display_puj }}</span>
                  <span>{{ pronunciation.display_dp }}</span>
                  <span v-if="pronunciation.display_ipa !== ''">[{{ pronunciation.display_ipa }}]</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框背景 -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import {darkThemeString} from "./QDarkTheme.vue";
</script>
<script lang="ts">
import TPopupPujBase from "./TPopupPujBase.vue";
import TDarkTheme from "./TDarkTheme.vue";

export default {
  name: "TPopupPuj",
  extends: TPopupPujBase,
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
.pronunciation-row {
  min-width: 100%;
}
/* 注意：Bootstrap 在本组件的 scoped 块内被 import，其 .badge 规则会带 [data-v-xxx]
   属性选择器（特异性 0,2,0），故此处必须提高选择器权重才能覆盖
   .badge 的 display / text-align / white-space: nowrap。 */
.pronunciation-row .badge.pronunciation-badge {
  min-width: 7em;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-right: 0.5em;
  /* 使口音名中的换行符（name + '\n' + variant）真正生效 */
  white-space: pre-line;
}
</style>
