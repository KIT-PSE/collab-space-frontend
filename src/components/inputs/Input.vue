<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="d-flex">
      <div class="w-100">
        <input
          class="form-control"
          :class="error ? 'is-invalid' : ''"
          :id="id"
          v-bind="$attrs"
          :value="modelValue"
          @input="input"
        />
        <div class="invalid-feedback">{{ error }}</div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  const id = crypto.randomUUID();

  defineProps<{
    label: string;
    modelValue?: any;
    error?: string;
  }>();

  const emits = defineEmits<{
    'update:modelValue': [value: any];
  }>();

  function input(event: Event) {
    emits('update:modelValue', (event.target as HTMLInputElement).value);
  }

  defineOptions({
    inheritAttrs: false,
  });
</script>
