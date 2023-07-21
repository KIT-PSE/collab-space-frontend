<template>
  <!-- Change Password Modal -->
  <Modal
    id="change-password-modal"
    title="Passwort ändern"
    submit-text="Speichern"
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
import {useAuth, useUser} from "@/composables/auth";


const auth = useAuth();

const { form, resetForm, errors } = useForm({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

async function changePassword() {
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Die Passwörter stimmen nicht überein.';
    return;
  }

  // TODO: Backend-Logik zur Passwortänderung implementieren
  // Hier musst du die Passwortänderung im Backend durchführen
  // und auf die Rückmeldung warten, ob die Änderung erfolgreich war

  // Erfolgsmeldung anzeigen oder auf Fehler reagieren

  // Passwortänderung erfolgreich, schließe das Modal
  closeModal('change-password-modal');
}


</script>
