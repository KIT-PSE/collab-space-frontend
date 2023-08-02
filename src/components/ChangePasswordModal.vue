<template>
  <Modal
    id="change-password-modal"
    title="Passwort ändern"
    submit-text="Passwort speichern"
    @submit="changePassword"
    @closed="form.clear()"
  >
    <PasswordInput
      label="Aktuelles Passwort"
      v-model="form.currentPassword"
      :error="form.errors.currentPassword"
    />

    <PasswordInput
      label="Neues Passwort"
      v-model="form.newPassword"
      :error="form.errors.newPassword"
    />

    <PasswordInput
      label="Passwort wiederholen"
      v-model="form.confirmNewPassword"
      :error="form.errors.confirmNewPassword"
    />
  </Modal>
</template>

<script setup lang="ts">
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import Modal from '@/components/Modal.vue';
  import { useForm } from '@/composables/form';
  import { closeModal } from '@/utils';
  import { ChangePassword, useApi } from '@/composables/api';

  const form = useForm<ChangePassword>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const api = useApi();

  async function changePassword() {
    const result = await form.submit((data) => api.updatePassword(data));

    if (!result) {
      return;
    }

    closeModal('change-password-modal');
  }
</script>
