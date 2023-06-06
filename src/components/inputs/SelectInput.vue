<template>
  <div class="mb-3">
    <label :for="id">{{ label }}</label>
    <select
      class="form-select"
      :class="error ? 'is-invalid' : ''"
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    >
      <option value="" disabled selected hidden>
        {{ placeholder ?? 'Bitte auswählen...' }}
      </option>
      <option
        v-for="(option, index) in options"
        :key="index"
        :value="option[0]"
      >
        {{ option[1] }}
      </option>
    </select>
    <div class="invalid-feedback">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
  const id = crypto.randomUUID();

  defineProps<{
    label: string;
    options: [string, any][];
    modelValue?: any;
    placeholder?: string;
    error?: string;
  }>();

  defineEmits<{
    'update:modelValue': (value: any) => void;
  }>();

  defineOptions({
    inheritAttrs: false,
  });
</script>
