<template>
  <Input
    :label="label"
    type="email"
    placeholder="name@example.de"
    :error="error"
    :autocomplete="autocomplete"
  >
    <slot></slot>
  </Input>
</template>
<script setup lang="ts">
  import Input from '@/components/inputs/Input.vue';

  defineProps<{
    label: string;
    error?: string;
    autocomplete?: string;
  }>();
</script>
