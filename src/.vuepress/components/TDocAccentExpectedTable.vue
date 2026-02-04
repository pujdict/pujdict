<template>
  <div class="table-container" style="overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch;">
    <table class="table table-striped table-bordered" style="width: 100%; table-layout: fixed;">
      <thead>
      <tr>
        <th class="sticky-header sticky-corner">口音</th>
        <th v-for="(header, index) in headers" :key="index" class="sticky-header">
          {{ header.char }}<br/><TPopupPujNoAccent :puj="header.puj" />
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <td class="sticky-column"><strong>{{ row.accent }}</strong></td>
        <td v-for="(cell, cellIndex) in row.cells" :key="cellIndex">
          <center><TPopupPujNoAccent :puj="cell" /></center>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import {withBase} from "vuepress/client";
import TPopupPujNoAccent from "./TPopupPujNoAccent.vue";

interface Header {
  char: string;
  puj: string;
}

interface Row {
  accent: string;
  cells: string[];
}

export default {
  components: {TPopupPujNoAccent},
  data() {
    return {
      headers: [] as Header[],
      rows: [] as Row[]
    }
  },
  mounted() {
    this.loadCSV();
  },
  methods: {
    async loadCSV() {
      try {
        const response = await fetch(withBase('/data/pujbase/data/accents_expected.csv'));
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Parse headers (first line)
        const headerLine = lines[0];
        const headerParts = headerLine.split(',');
        this.headers = headerParts.slice(1).map(part => {
          const [char, puj] = part.split('/');
          return { char, puj };
        });
        
        // Parse data rows (skip first line and empty lines)
        this.rows = lines.slice(1).filter(line => line.trim()).map(line => {
          const parts = line.split(',');
          return {
            accent: parts[0].split('/')[0],
            cells: parts.slice(1)
          };
        });
      } catch (error) {
        console.error('Failed to load CSV:', error);
      }
    }
  }
}
</script>

<style scoped lang="scss">
table {
  border-collapse: separate;
}

td, th {
  width: 7em;
  height: 30px;
}

td:first-child, th:first-child {
  width: 4em;
  padding: 5px;
}

th {
  background-color: var(--bg-color);
}

td:first-child, th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: var(--bg-color);
}

thead tr th {
  position: sticky;
  top: 0;
}

th:first-child {
  z-index: 2;
  background-color: var(--bg-color);
}
</style>