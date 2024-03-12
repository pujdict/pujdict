---
title: 人体
---

<script setup>
import TAppendix from '@components/TAppendix.vue';
import file from '!!raw-loader!@public/data/appendix/human_body.csv';
</script>

<TAppendix :file="file" />

