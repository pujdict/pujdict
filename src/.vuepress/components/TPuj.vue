<template>
  {{ result }}
</template>
<script>
import {
  addPUJToneMarkAndConvertToDisplayPUJSentence
} from "./SPuj.js";

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
      this.result = addPUJToneMarkAndConvertToDisplayPUJSentence(this.puj);
    },
  }
};
</script>