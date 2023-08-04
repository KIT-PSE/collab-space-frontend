<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="d-flex">
      <div class="w-100">
        <input
          class="form-control"
          :class="error ? 'is-invalid' : ''"
          :id="id"
          placeholder="Lorem Ipsum"
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

  /**
   * Function to handle input events.
   * This function emits the 'update:modelValue' event with the new value of the input field whenever an input event occurs.
   * The new value is obtained from the 'event.target' which is cast to an HTMLInputElement.
   * @param {Event} event - The input event.
   */
  function input(event: Event) {
    emits('update:modelValue', (event.target as HTMLInputElement).value);
  }

  defineOptions({
    inheritAttrs: false,
  });
</script>
