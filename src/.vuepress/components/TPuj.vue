<template>
  {{ result }}
</template>
<script>
import {
  addPUJToneMarkAndConvertToDisplaySentence
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
      this.result = addPUJToneMarkAndConvertToDisplaySentence(this.puj);
    },
  }
};
</script>