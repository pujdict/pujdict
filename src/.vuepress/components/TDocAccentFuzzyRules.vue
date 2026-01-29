<template>
  <template v-for="(rule, ruleIndex) in rules">
    <h3 :id="rule.id" tabindex="-1">
      <a class="header-anchor" :href="'#' + rule.id">
        <span>模式{{ ruleIndex + 1 }}：{{ rule.title }}</span>
      </a>
    </h3>
    <p v-if="rule.note">
      {{ rule.note }}<br/>
    </p>
    代码标识符：<code>{{ rule.id }}</code>
    <br/>
    典型例字：<template v-for="(eg, egIndex) in rule.examples"><template v-if="egIndex">、</template>{{ eg }}</template>
    <br/>
    变换运算：
    <ul>
      <template v-for="act in rule.actions">
        <li><code>{{ act.action }}/{{ act.pattern }}/{{ act.replacementDollar }}/</code></li>
      </template>
    </ul>
  </template>
</template>

<script setup lang="ts">

</script>
<script lang="ts">
import {pujpb} from "./SPujPb";
import {withBase} from "vuepress/client";
export default {
  data() {
    return {
      rules: []
    }
  },
  mounted() {
    const fetchData = (filename: string) =>
        fetch(withBase(`/data/pujbase/dist/${filename}.pb`), {method: 'GET', mode: 'no-cors', credentials: 'include',})
            .then(response => response.arrayBuffer());
    fetchData('accents').then(response => {
      const accentsData = pujpb.Accents.decode(new Uint8Array(response));
      this.rules = accentsData.fuzzyRuleDescriptors;
    });
  },
}
</script>

<style scoped lang="scss">

</style>