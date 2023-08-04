<template>
  <div class="mb-3">
    <label :for="id">{{ label }}</label>
    <select
      class="form-select"
      :class="error ? 'is-invalid' : ''"
      :id="id"
      :value="modelValue"
      @change="change"
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

  const emits = defineEmits<{
    'update:modelValue': [value: any];
  }>();

  /**
   * Function to handle change events.
   * This function emits the 'update:modelValue' event with the new value of the input field whenever a change event occurs.
   * The new value is obtained from the 'event.target' which is cast to an HTMLInputElement.
   * @param event - The change event.
   */
  function change(event: Event) {
    emits('update:modelValue', (event.target as HTMLInputElement).value);
  }

  defineOptions({
    inheritAttrs: false,
  });
</script>
