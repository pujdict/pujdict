<template>
  <span class="ms-2 query-tooltip" data-bs-toggle="tooltip" data-bs-placement="bottom" :title="title">
    <img :src="src" alt="" class="svg-icon" style="cursor:help;"/>
  </span>
  <div id="bs-tooltips-template">
    <!-- Vue 会自动填充 data-v-xxx tag -->
    <div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>
  </div>
</template>

<script setup lang="ts">
</script>

<script lang="ts">
import {withBase} from "vuepress/client";
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      src: withBase('/assets/image/question-mark-tip.svg'),
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      import("bootstrap").then(({ Tooltip: BSTooltip }) => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const template = document.querySelector("#bs-tooltips-template");
        const templateHTML = template.innerHTML;
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new BSTooltip(tooltipTriggerEl, {
            template: templateHTML,
            sanitize: false, // 不要自动消除 Vue 生成的 data-v-xxx
            html: true,
          });
        });
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/bootstrap';
</style>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}
.query-tooltip:hover {
  cursor: help;
}
.tooltip-inner {
  text-align: left;
}
</style>