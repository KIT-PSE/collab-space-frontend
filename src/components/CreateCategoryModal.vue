<template>
  <Modal
    id="create-category-modal"
    title="Neue Kategorie anlegen"
    submit-text="Hinzufügen"
    @submit="submit"
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
  import { useCategories } from '@/store/categories';
  import { closeModal } from '@/utils';

  const categories = useCategories();

  const form = useForm({ name: '' });

  async function submit() {
    await form.submit((data) => categories.create(data));

    closeModal('create-category-modal');
    setTimeout(() => form.clear(), 500);
  }
</script>