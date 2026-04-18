---
title: 各地口音及演变模式
order: 5
date: 2025-01-27
---

<script setup>
import TToneLetter from '@components/TToneLetter.vue';
import TPopupPujNoAccent from '@components/TPopupPujNoAccent.vue';
import TDocAccentFuzzyRules from '@components/TDocAccentFuzzyRules.vue';
import TDocAccentExpectedTable from '@components/TDocAccentExpectedTable.vue';
</script>
<style>
li > ol > li {
  list-style: lower-roman;
}
</style>

“潮州九县，县县有语”，
各地经过长时间的演变，也发展出了各具特色的音系。
不过，具体到同一个市、同一个县的人，发音也可能受各种影响产生差异，
还会有所谓“老派”“新派”“新新派”等等说法，
穷举具体每个人的口音是不可能也是没必要的。
本文以及辞典内部数据定义的口音点和演变模式，关注的是区域内总体性的规律，
口音主要采用比较经典的老派音（例如潮州府城保留闭口韵尾，潮阳保留通摄三等 [i] 介音等）。

## 典型例字口音表

下表展示了辞典中各口音的发音情况，仅列出可能有异读的典型例字。

<TDocAccentExpectedTable />

## 口音演变模式

本辞典中，定义了若干从标准音映射到各地口音的**演变模式**。
代码和数据库中，则是早期开发时参考了普通话拼音输入法的“模糊音”概念，
将这些演变模式称为“模糊音规则（Fuzzy Rules）”，下文统一称为“演变模式”。
一个具体的“口音”，由若干“演变模式”组合形成。
可以在这些模式的基础上组合出合适自己使用的口音。

<TDocAccentFuzzyRules />

[//]: # (## 常见自由变体)
