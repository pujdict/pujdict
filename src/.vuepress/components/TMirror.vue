<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'

const MAIN_DOMAIN = 'pujdict.sourceforge.io';
// const MAIN_DOMAIN = 'localhost';
const MIRROR_DOMAIN = 'pujdict.com';

const isMainSite = ref(false);
const mirrorUrl = computed(() => `https://${MIRROR_DOMAIN}${window.location.pathname}`);

onMounted(() => {
  if (typeof window !== 'undefined') {
    isMainSite.value = window.location.hostname === MAIN_DOMAIN;
  }
})
</script>

<template>
  <p style="font-size: 14px" v-if="isMainSite">
    若加载较慢，可访问<a :href="mirrorUrl">镜像站</a>。
  </p>
</template>

<style scoped lang="scss">

</style>
