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

该工具用于将汉字转为白话字，并标注连调组和声调地位。

- 点击两字之间的 <code>/</code> 按钮，可在该处添加或取消连调组边界；添加时 <code>/</code> 之前的一个字自动勾选为本调 Ｘ。
- 勾选每个字下方的复选框可将该字标记为本调 Ｘ；连续勾选两个字时，后一个为 Ｘ，前一个为重读前变调 Ｗ。
  同一连调组内 Ｘ 之前的字自动为 Ｙ（前变调），之后的字自动为 Ｚ（后变调／轻声）。
- 点击两字之间的 <code>\_</code> 按钮，标记这两个字属于同一个词（再点取消），导出时两个音节以 <code>_</code> 相连。
- 标点符号自动分隔连调组，导出时中文标点转为对应的西文标点；标点之前（以及没有标点收尾的行末）的最后一个汉字自动勾选为 Ｘ。
- 导出结果中 <code>/</code> 为连调组边界，<code>\*</code> 表示读本调的 Ｘ 字，<code>_</code> 为分词（暂不支持）。

目前暂不支持分词的自动划分。

---

<THanPuj />
