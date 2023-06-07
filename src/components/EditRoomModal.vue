<template>
  <Modal
    id="edit-room-modal"
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
  import { Room } from '@/composables/api';
  import { useStore } from '@/composables/store';
  import { closeModal } from '@/utils';
  import { watch } from 'vue';

  const store = useStore();

  const form = useForm({
    name: '',
  });

  const props = defineProps<{
    room: Room | null;
  }>();

  watch(
    () => props.room,
    () => {
      form.name = props.room?.name ?? '';
    },
  );

  async function submit() {
    const result = await form.submit((data) =>
      store.updateRoom(props.room!, data),
    );

    if (!result) {
      return;
    }

    closeModal('edit-room-modal');
  }

  function onClose() {
    form.name = props.room?.name ?? '';
  }
</script>