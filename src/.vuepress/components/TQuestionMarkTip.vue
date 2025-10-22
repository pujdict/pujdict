<template>
  <span class="ms-2 query-tooltip" data-bs-toggle="tooltip" data-bs-placement="bottom" :title="title">
    <img :src="src" alt="" class="svg-icon" style="cursor:help;"/>
  </span>
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
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}
</style>