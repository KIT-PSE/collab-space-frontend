<template>
  <!-- Change Password Modal -->
  <Modal
      id="change-password-modal"
      title="Passwort ändern"
      submit-text="Passwort speichern"
      @submit="changePassword"
      @closed="resetForm"
  >
    <PasswordInput
        label="Aktuelles Passwort"
        v-model="form.currentPassword"
        :error="errors.currentPassword"
    />

    <PasswordInput
        label="Neues Passwort"
        v-model="form.newPassword"
        :error="errors.newPassword"
    />

    <PasswordInput
        label="Passwort wiederholen"
        v-model="form.confirmPassword"
        :error="errors.confirmPassword"
    />
  </Modal>
</template>

<script setup lang="ts">
import PasswordInput from '@/components/inputs/PasswordInput.vue';
import Modal from '@/components/Modal.vue';
import { useForm } from '@/composables/form';
import { closeModal } from '@/utils';
import { useApi } from '@/composables/api';
import { ValidationError } from '@/composables/fetch';

const { form, errors, clearErrors, submit } = useForm({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const api = useApi();

async function changePassword() {
  if (form.newPassword !== form.confirmPassword) {
    clearErrors();
    errors.confirmPassword = 'Die Passwörter stimmen nicht überein.';
    return;
  }

  try {
    const result = await submit(async (data) => {
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
    console.error('Fehler bei der Passwortänderung:', error.message);
  }
}
</script>
