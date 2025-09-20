<template></template>
<script setup>
</script>
<script>
import {darkThemeString} from './QDarkTheme.vue';

export default {
  methods: {
    darkThemeObserver(mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          darkThemeString.value = mutation.target.getAttribute('data-theme');
        }
      }
    }
  },
  mounted() {
    // Access the <html> element
    const htmlElement = document.querySelector('html');
    darkThemeString.value = htmlElement.getAttribute('data-theme');

    // Create a MutationObserver to observe changes in attributes
    const observer = new MutationObserver(this.darkThemeObserver);

    // Start observing the <html> element
    observer.observe(htmlElement, {attributes: true});
  }
}
</script>