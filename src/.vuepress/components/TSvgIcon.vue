<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {withBase} from "vuepress/client";

const props = defineProps<{
  svg?: string
}>()

const svgContent = ref('')

onMounted(async () => {
  if (props.svg) {
    try {
      const response = await fetch(withBase(props.svg))
      svgContent.value = await response.text()
    } catch (error) {
      console.error('Failed to load SVG:', error)
    }
  }
})
</script>

<template>
  <span v-if="svgContent" v-html="svgContent" class="t-svg-current-color" />
</template>

<style scoped>
.t-svg-current-color :deep(svg) {
  fill: currentColor;
}
</style>
