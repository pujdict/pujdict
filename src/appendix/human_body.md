---
title: 人体
---

<script setup>
import QAppendix from '@components/QAppendix.vue';
import file from '!!raw-loader!@public/data/appendix/human_body.csv';
// import file from '@public/data/appendix/human_body.csv?raw';
</script>

<QAppendix :file="file" />

