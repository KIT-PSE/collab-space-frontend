<template>
  <Modal
    id="create-room-modal"
    title="Neuen Raum erstellen"
    submit-text="Erstellen"
    @submit="submit"
    @closed="form.clear()"
  >
    <Input
      label="Name des Raums"
      v-model="form.name"
      :error="form.errors.name"
    />

    <SelectInput
      :options="categoryOptions"
      label="Kategorie des Raums"
      v-model="form.categoryId"
      :error="form.errors.categoryId"
    />

    <PasswordInput
      label="Den Raum mit einem Passwort schützen?"
      v-model="form.password"
      :error="form.errors.password"
    />
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/components/Modal.vue';
  import Input from '@/components/inputs/Input.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import SelectInput from '@/components/inputs/SelectInput.vue';
  import { computed } from 'vue';
  import { useForm } from '@/composables/form';
  import { useStore } from '@/composables/store';
  import { CreateRoom } from '@/composables/api';
  import { closeModal } from '@/utils';

  const store = useStore();

  const categoryOptions = computed<[string, string][]>(() =>
    store.categories.map((category) => [category.id.toString(), category.name]),
  );

  const form = useForm<CreateRoom>({
    name: '',
    categoryId: '',
    password: '',
  });

  /**
   * Asynchronous function that handles the process of submitting a form to create a room.
   * This function checks if a category has been selected, sets an error message if not,
   * and then calls the 'store.createRoom()' function to create a room using the form data.
   */
  async function submit() {
    if (!form.categoryId) {
      form.errors.categoryId = 'Bitte wähle eine Kategorie aus.';
      return;
    }

    const result = await form.submit((data) => store.createRoom(data));

    if (result) {
      closeModal('create-room-modal');
    }
  }
</script>
