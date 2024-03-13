---
title: 白话字整理与注音
icon: wrench
order: 10
gitInclude:
  - ../.vuepress/components/TPujUnify.vue
---

<script setup>
import TPujUnify from '@components/TPujUnify.vue';
import TPuj from '@components/TPuj.vue';
</script>

该工具用于给白话字注音。例如，输入 "Peh8-ue7-ji7" 可以转换输出为 "<TPuj puj="Peh8-ue7-ji7"/>"。  
输入单个的 v 和 r 可分别转换为 <TPuj puj="v"/> 和 <TPuj puj="r"/>。  
输入 ir/ur/er 会保留不变。

---

<TPujUnify />
