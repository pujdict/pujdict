<template>
  <table class="table table-striped table-bordered" style="table-layout: fixed;">
    <thead>
    <tr>
      <th style="width: 1em;">#</th>
      <th style="width: 25em;">规则</th>
      <th style="width: 5em;">典型例字</th>
      <!--        <th>变换运算</th>-->
    </tr>
    </thead>
    <tbody>
    <tr v-for="(rule, ruleIndex) in rules" :key="rule.id">
      <td>{{ ruleIndex + 1 }}</td>
      <td>
        <strong>{{ rule.title }}</strong>
        <br/>
        演变：{{ rule.ipa }}
        <br/>
        标识符：<code>{{ rule.id }}</code>
        <br/>
        <template v-if="rule.note">{{ rule.note }}</template>
      </td>
      <td>
        <template v-for="(eg, egIndex) in rule.examples">{{ eg }}</template>
      </td>
      <!--        <td>-->
      <!--          <ul>-->
      <!--            <template v-for="act in rule.actions">-->
      <!--              <li><code>{{ act.action }}/{{ act.pattern }}/{{ act.replacementDollar }}/</code></li>-->
      <!--            </template>-->
      <!--          </ul>-->
      <!--        </td>-->
    </tr>
    </tbody>
  </table>
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
.rules-table {
  width: 100%;
  border-collapse: collapse;
  //margin: 1rem 0;
}
</style>