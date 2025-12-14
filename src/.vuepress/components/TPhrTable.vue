<template>
  <TDarkTheme/>
  <div v-bind:data-bs-theme="darkThemeString">
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage" :disabled="currentPage === 1">上一页</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">{{ currentPage }} 页 / {{ totalPages }} 页</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </li>
      </ul>
      <div class="d-flex gap-3 mt-3">
        <select class="form-select" style="width: 150px;" v-model="itemsPerPage" @change="changeItemsPerPage(parseInt($event.target.value))">
          <option v-for="option in itemsPerPageOptions" :value="option">{{ option }} 条/页</option>
        </select>
        <div data-mdb-input-init class="input-group form-outline" style="width: 150px;">
          <input id="page-number" type="number" class="form-control" v-model="jumpToPage" min="1" :max="totalPages" placeholder="页码">
          <button class="btn btn-outline-secondary" type="button" @click="jumpToPageHandler">跳转</button>
        </div>
      </div>
    </nav>
    <table class="table table-striped table-bordered" style="table-layout: fixed;">
      <thead class="thead-dark">
      <tr>
        <th style="width: 5em;">潮州话</th>
        <th style="width: 10em;">拼音</th>
        <th style="width: 5em;">普通话</th>
        <th style="width: 12em;">释义</th>
        <th style="width: 4em;">词性</th>
        <th style="width: 6em;">标签</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="items.length" v-for="phraseIndex in paginatedItems" :key="phraseIndex">
        <td>
          <template v-for="(teochew, i) of items[phraseIndex].teochew">
            <template v-if="i"><br/></template>{{ teochew }}
          </template>
        </td>
        <td>
          <template v-for="(puj, i) of items[phraseIndex].puj" :key="`${puj}${i}`">
            <template v-if="i"><br/></template><TPopupPuj :puj="puj" :charsList="[...items[phraseIndex].teochew]"/>
          </template>
        </td>
        <td>
          <template v-for="(cmn, i) of items[phraseIndex].cmn">
            <template v-if="i"><br/></template>{{ cmn }}
          </template>
        </td>
        <td>
          {{ items[phraseIndex].desc }}
        </td>
        <td>
          <template v-for="(wordClass, i) of items[phraseIndex].wordClass">
            <template v-if="i"><br/></template>{{ wordClass }}
          </template>
        </td>
        <td>
          <template v-for="(tag, i) of items[phraseIndex].tagDisplay">
            <template v-if="i"><br/></template>{{ tag }}
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import TDarkTheme from "./TDarkTheme.vue";
import {darkThemeString} from "./QDarkTheme.vue";
</script>

<script lang="ts">
import {
  addPUJToneMarkAndConvertToDisplayPUJSentence,
} from './SPuj';
import {
  Pronunciation,
  getAccentsRules,
  initFromDatabase,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
  getFuzzyPronunciation,
  // $,
  db,
  isChineseChar, PhraseSyllable,
} from './QCommon.vue';
import {pujpb} from "./SPujPb";
import TPopupPuj from "./TPopupPuj.vue";


export default {
  name: "TPhrTable",
  components: {TPopupPuj},
  props: {
  },
  data() {
    return {
      items: new Array<pujpb.IPhrase>(),
      currentPage: 1,
      itemsPerPage: 20,
      itemsPerPageOptions: [10, 20, 50, 100],
      jumpToPage: 1,
    };
  },
  computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = Math.min(start + this.itemsPerPage, this.items.length);
      const result = [];
      for (let i = start; i < end; ++i) {
        result.push(i);
      }
      return result;
    },
    totalPages() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
  },
  mounted() {
    initFromDatabase().then(() => {
      this.items = db.phrases;
    });
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    changeItemsPerPage(value) {
      this.itemsPerPage = value;
      this.currentPage = 1;
    },
    jumpToPageHandler() {
      if (this.jumpToPage >= 1 && this.jumpToPage <= this.totalPages) {
        this.currentPage = this.jumpToPage;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "bootstrap/scss/bootstrap";
</style>
