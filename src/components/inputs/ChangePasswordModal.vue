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
      v-model="currentPassword"
      :error="errors.currentPassword"
    />

    <PasswordInput
      label="Neues Passwort"
      v-model="newPassword"
      :error="errors.newPassword"
    />

    <PasswordInput
      label="Passwort wiederholen"
      v-model="confirmPassword"
      :error="errors.confirmPassword"
    />
  </Modal>
</template>

<script setup lang="ts">
import PasswordInput from '@/components/inputs/PasswordInput.vue';
import Modal from '@/components/Modal.vue';
import { useForm } from '@/composables/form';
import { closeModal } from '@/utils';
import {useApi} from "@/composables/api";


const { form, resetForm, errors } = useForm({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const api = useApi();

async function changePassword() {
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Die Passwörter stimmen nicht überein.';
    return;
  }

  try {
    await api.updatePassword({
      currentPassword: currentPassword,
      newPassword: newPassword,
    });

    console.log('Passwort erfolgreich geändert.');

    closeModal('change-password-modal');
  } catch (error) {
    console.error('Fehler bei der Passwortänderung:', error.message);
  }

}


</script>
