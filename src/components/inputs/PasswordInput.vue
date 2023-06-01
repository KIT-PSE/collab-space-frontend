<template>
  <Input
    :label="label"
    type="password"
    placeholder="Passwort"
    :invalid="invalid"
  >
    <slot></slot>
  </Input>
</template>
<script setup lang="ts">
  import Input from '@/components/inputs/Input.vue';

  defineProps<{
    label: string;
    invalid?: boolean;
  }>();
</script>
