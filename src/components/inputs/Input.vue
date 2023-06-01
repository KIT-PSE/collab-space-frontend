<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="d-flex">
      <div class="w-100">
        <input
          class="form-control"
          :class="invalid ? 'is-invalid' : ''"
          :id="id"
          placeholder="Lorem Ipsum"
          v-bind="$attrs"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <div class="invalid-feedback">Bitte gib einen gültigen Wert ein.</div>
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
    invalid?: boolean;
  }>();

  defineEmits<{
    'update:modelValue': (value: any) => void;
  }>();

  defineOptions({
    inheritAttrs: false,
  });
</script>
