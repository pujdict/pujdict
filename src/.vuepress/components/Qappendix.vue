<template>
  <div>
    <table>
      <thead>
      <tr>
        <th>潮州话</th>
        <th>白话字</th>
        <th>普通话</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in items" :key="item">
        <td>{{ item.teochew }}</td>
        <td>{{ item.puj }}</td>
        <td>{{ item.mandarin }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
</script>

<script>
import {
  Entry, Pronunciation,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
  setLoading, setOptionInCookie, getOptionInCookie, setUrlQueryParameter, resetUrlQueryParameter,
} from './Qcommon.vue';
// import papaparse
import Papaparse from 'papaparse';
import {withBase} from "vuepress/client";

class TableEntry {
  constructor(teochew, puj, mandarin) {
    this.teochew = teochew;
    this.puj = puj;
    this.mandarin = mandarin;
  }
}

export default {
  props: {
    filename: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      items: []
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const response = await fetch(withBase(`/data/appendix/${this.filename}.csv`));
        const text = await response.text();
        // noinspection JSUnresolvedReference
        Papaparse.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.items = results.data.map((item) => {
              const teochew = item.teochew;
              const puj = addPUJToneMarkAndUnify(item.puj);
              const mandarin = item.mandarin !== '' ? item.mandarin : item.teochew;
              return new TableEntry(teochew, puj, mandarin);
            });
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
  }
};
</script>

<style scoped>
</style>
