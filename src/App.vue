<template>
  <Alerts />
  <RouterView />
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Alerts from '@/components/Alerts.vue';
</script>
