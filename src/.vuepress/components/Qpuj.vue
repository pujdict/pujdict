<template>
  <slot>{{ result }}</slot>
</template>
<script>
import {
  Entry, Pronunciation,
  unifyWordDisplay, addPUJToneMark, addPUJToneMarkForSingle, addPUJToneMarkAndUnify,
  setLoading, setLocalOption, getLocalOption, setUrlQueryParameter, resetUrlQueryParameter,
} from './Qcommon.vue';

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
  mounted() {
    this.parsePUJ();
  },
  methods: {
    parsePUJ() {
      this.result = addPUJToneMarkAndUnify(this.puj);
    },
  }
};
</script>