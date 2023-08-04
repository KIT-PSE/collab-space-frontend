<template>
  <Modal
    id="edit-category-modal"
    title="Kategorie bearbeiten"
    @submit="submit"
    @closed="onClose"
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
  import { useForm } from '@/composables/form';
  import Input from '@/components/inputs/Input.vue';
  import { Category } from '@/composables/api';
  import { useStore } from '@/composables/store';
  import { closeModal } from '@/utils';
  import { watch } from 'vue';

  const store = useStore();

  const form = useForm({
    name: '',
  });

  const props = defineProps<{
    category: Category | null;
  }>();

  watch(
    () => props.category,
    () => {
      form.name = props.category?.name ?? '';
    },
  );

  /**
   * Asynchronous function that handles the process of submitting a form to update a category.
   * It calls the 'store.updateCategory()' function with the form data to update the category.
   * If the update is successful, it closes the 'edit-category-modal' modal.
   */
  async function submit() {
    const result = await form.submit((data) =>
      store.updateCategory(props.category!, data),
    );

    if (!result) {
      return;
    }

    closeModal('edit-category-modal');
  }

  /**
   * Function called when the 'edit-category-modal' modal is closed.
   * It resets the form 'name' field to the original category name (if available).
   */
  function onClose() {
    form.name = props.category?.name ?? '';
  }
</script>
