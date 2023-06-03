<template>
  <div class="row">
    <div
      v-for="category in categories.categories"
      :key="category"
      class="col-lg-9"
    >
      <div class="d-flex justify-content-between">
        <h3>{{ category.name }}</h3>
        <div>
          <button class="btn text-secondary" @click="edit(category)">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn text-secondary" @click="destroy(category)">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="row py-4"></div>
    </div>
  </div>

  <Modal
    id="edit-category-modal"
    title="Kategorie bearbeiten"
    @submit="submitEdit"
  >
    <Input
      label="Name der Kategorie"
      v-model="editForm.name"
      :error="editForm.errors.name"
    />
  </Modal>
</template>

<script setup lang="ts">
  import { useCategories } from '@/store/categories';
  import { useAuth } from '@/composables/auth';
  import Modal from '@/components/Modal.vue';
  import Input from '@/components/inputs/Input.vue';
  import { closeModal, openModal } from '@/utils';
  import { useForm } from '@/composables/form';
  import { Category } from '@/api/category.api';
  import { ask } from '@/composables/prompt';

  const auth = useAuth();
  const categories = useCategories();

  categories.load();
  auth.onLogout(() => categories.unload());

  let categoryToEdit = null;
  const editForm = useForm({ name: '' });

  function edit(category) {
    openModal('edit-category-modal');
    editForm.name = category.name;
    categoryToEdit = category;
  }

  async function submitEdit() {
    await editForm.submit((data) => categories.update(categoryToEdit, data));
    closeModal('edit-category-modal');
    setTimeout(() => editForm.clear(), 500);
  }

  async function destroy(category: Category) {
    const shouldDestroy = await ask(
      'Kategorie löschen',
      `Soll die Kategorie <b>${category.name}</b> wirklich gelöscht werden?`,
      'Löschen',
    );

    if (!shouldDestroy) {
      return;
    }

    await categories.delete(category);
  }
</script>
