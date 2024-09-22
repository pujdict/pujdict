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
  fuzzyRules,
  convertPlainPUJSentenceToDisplayPUJSentence, addPUJToneMarkSentence, addPUJToneMarkWord, addPUJToneMarkAndConvertToDisplayPUJSentence,
} from './SPuj.js';
// import papaparse
import Papaparse from 'papaparse';

class TableEntry {
  constructor(teochew, puj, mandarin) {
    this.teochew = teochew;
    this.puj = puj;
    this.mandarin = mandarin;
  }
}

export default {
  props: {
    file: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      items: []
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      try {
        const text = this.file;
        Papaparse.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.items = results.data.map((item) => {
              const teochew = item.teochew;
              const puj = addPUJToneMarkAndConvertToDisplayPUJSentence(item.puj);
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
