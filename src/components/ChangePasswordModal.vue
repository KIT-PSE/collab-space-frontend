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
      autocomplete="current-password"
    />

    <PasswordInput
      label="Neues Passwort"
      v-model="form.newPassword"
      :error="form.errors.newPassword"
      autocomplete="new-password"
    />

    <PasswordInput
      label="Passwort wiederholen"
      v-model="form.confirmNewPassword"
      :error="form.errors.confirmNewPassword"
      autocomplete="new-password"
    />
  </Modal>
</template>

<script setup lang="ts">
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import Modal from '@/components/Modal.vue';
  import { useForm } from '@/composables/form';
  import { closeModal } from '@/utils';
  import { useApi } from '@/composables/api';

  const form = useForm({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const api = useApi();

  async function changePassword() {
    if (form.newPassword !== form.confirmNewPassword) {
      form.clearErrors();
      form.errors.confirmNewPassword = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    try {
      const result = await form.submit(async (data) => {
        await api.updatePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
      });

      if (result !== null) {
        console.log('Passwort erfolgreich geändert.');
        closeModal('change-password-modal');
      } else {
        console.error('Fehler bei der Passwortänderung.');
      }
    } catch (error) {
      console.error('Fehler bei der Passwortänderung:', error);
    }
  }
</script>
