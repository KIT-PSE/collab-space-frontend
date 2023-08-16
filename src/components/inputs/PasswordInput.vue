<template>
  <Input
    :label="label"
    :type="show ? 'text' : 'password'"
    placeholder="Passwort"
    :error="error"
    :autocomplete="autocomplete"
  >
    <slot></slot>
    <button
      v-if="showChangeVisible"
      class="btn position-absolute end-0 top-50 translate-middle-y"
      type="button"
      @click="show = !show"
    >
      <i class="fa" :class="show ? 'fa-eye-slash' : 'fa-eye'"></i>
    </button>
  </Input>
</template>
<script setup lang="ts">
  import Input from '@/components/inputs/Input.vue';
  import { ref } from 'vue';

  const show = ref(false);

  defineProps<{
    label: string;
    error?: string;
    autocomplete?: string;
    showChangeVisible?: boolean;
  }>();
</script>
