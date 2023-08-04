<template>
  <Modal
    id="create-category-modal"
    title="Neue Kategorie anlegen"
    submit-text="Hinzufügen"
    @submit="submit"
    @closed="form.clear()"
  >
    <Input
      label="Name der Kategorie"
      v-model="form.name"
      :error="form.errors.name"
    />
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/components/Modal.vue';
  import Input from '@/components/inputs/Input.vue';
  import { useForm } from '@/composables/form';
  import { closeModal } from '@/utils';
  import { useStore } from '@/composables/store';

  const store = useStore();

  const form = useForm({ name: '' });

  /**
   * Asynchronous function that handles the process of submitting a form to create a category.
   */
  async function submit() {
    const result = await form.submit((data) => store.createCategory(data));

    if (!result) {
      return;
    }

    closeModal('create-category-modal');
  }
</script>
