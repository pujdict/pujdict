<template>
  {{ result }}
</template>
<script>
import {
  Entry, Pronunciation,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
} from './QCommon.vue';

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