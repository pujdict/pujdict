---
title: 汉字—白话字转换
icon: wrench
order: 11
gitInclude:
  - ../.vuepress/components/THanPuj.vue
---

<script setup>
import THanPuj from '@components/THanPuj.vue';
</script>

该工具用于将汉字转为白话字。
目前暂不支持多音字的自动选择，以及添加连字符。
多音字请自行校对。

---

<THanPuj />
