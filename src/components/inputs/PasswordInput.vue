<template>
  <Input :label="label" type="password" placeholder="Passwort" :error="error">
    <slot></slot>
  </Input>
</template>
<script setup lang="ts">
  import Input from '@/components/inputs/Input.vue';

  defineProps<{
    label: string;
    error?: string;
  }>();
</script>
