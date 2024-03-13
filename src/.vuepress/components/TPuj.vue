<template>
  {{ result }}
</template>
<script>
import {
  addPUJToneMarkAndConvertToDisplay
} from "./QPuj.vue";

export default {
  props: {
    puj: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      result: '',
    };
  },
  created() {
    this.parsePUJ();
  },
  methods: {
    parsePUJ() {
      this.result = addPUJToneMarkAndConvertToDisplay(this.puj);
    },
  }
};
</script>