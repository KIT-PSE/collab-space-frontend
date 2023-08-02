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
    if (form.currentPassword === '') {
      form.clearErrors();
      form.errors.currentPassword = 'Bitte gib dein aktuelles Passwort ein.';
      return;
    }
    if (form.newPassword === '') {
      form.clearErrors();
      form.errors.newPassword = 'Bitte gib ein neues Passwort ein.';
      return;
    }
    if (form.confirmNewPassword === '') {
      form.clearErrors();
      form.errors.confirmNewPassword = 'Bitte wiederhole dein neues Passwort.';
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      form.clearErrors();
      form.errors.confirmNewPassword = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    form.clearErrors();
    try {
      const result = await api.updatePassword({
        currentPassword: form.data().currentPassword,
        newPassword: form.data().newPassword,
      });

      if (result) {
        console.log('Passwort erfolgreich geändert.');
        closeModal('change-password-modal');
      }
    } catch (error) {
      form.errors.currentPassword = 'Das aktuelle Passwort ist falsch.';
    }
  }
</script>
