<template>
  {{ result }}
</template>
<script>
import {
  addPUJToneMarkAndUnify
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
      this.result = addPUJToneMarkAndUnify(this.puj);
    },
  }
};
</script>