
<template>
  <span class="tone-letters">{{ letters }}</span>
</template>

<style scoped lang="scss">
.tone-letters {
  font-family: IPAToneLetter, sans-serif;
  font-size: 1.3em;
  line-height: 0.5em;
}
</style>

<script lang="ts">
import {convertToneValueToToneLetters} from "./SPuj.js";

export default {
  name: "TToneLetter",
  props: {
    v: {
      required: true,
    },
    sandhi: {
      type: Boolean,
      default: false,
    },
    neutral: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    letters() {
      // if (this.v % 10 === this.v / 10) this.v = this.v % 10;
      return convertToneValueToToneLetters(parseInt(this.v), this.sandhi, this.neutral);
    },
  },
}
</script>
