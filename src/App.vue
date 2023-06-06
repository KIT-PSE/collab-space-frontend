<template>
  <Alerts />
  <RouterView />
  <PromptModal />
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Alerts from '@/components/Alerts.vue';
  import PromptModal from '@/components/PromptModal.vue';
</script>
