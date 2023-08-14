<template>
  <Layout title="Account Einstellungen" :buttons="['back']">
    <div class="row">
      <h2 class="mb-4">Account-Daten ändern</h2>

      <div class="col-md-6">
        <Input
          label="Schule / Universität oder Organisation"
          v-model="user.organization"
          :disabled="disabledInputs[0].value"
        >
          <button class="btn btn-secondary ms-2" @click="edit(0)">
            {{ disabledInputs[0].value ? 'Ändern' : 'Speichern' }}
          </button>
        </Input>

        <Input
          label="Name"
          v-model="user.name"
          :disabled="disabledInputs[1].value"
          autocomplete="name"
        >
          <button class="btn btn-secondary ms-2" @click="edit(1)">
            {{ disabledInputs[1].value ? 'Ändern' : 'Speichern' }}
          </button>
        </Input>

        <EmailInput
          label="E-Mail Adresse"
          v-model="user.email"
          :disabled="disabledInputs[2].value"
          autocomplete="email"
        >
          <button class="btn btn-secondary ms-2" @click="edit(2)">
            {{ disabledInputs[2].value ? 'Ändern' : 'Speichern' }}
          </button>
        </EmailInput>

        <PasswordInput label="Passwort" model-value="12345678" disabled>
          <button
            @click="openChangePasswordModal"
            class="btn btn-secondary ms-2"
          >
            Ändern
          </button>
        </PasswordInput>

        <button class="btn btn-danger mt-3" @click="deleteAccount">
          Account löschen
        </button>
      </div>
    </div>
  </Layout>

  <ChangePasswordModal />
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import Input from '@/components/inputs/Input.vue';
  import EmailInput from '@/components/inputs/EmailInput.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import { useAuth, useUser } from '@/composables/auth';
  import { ask } from '@/composables/prompt';
  import { ref } from 'vue';
  import { useAlerts } from '@/composables/alerts';
  import ChangePasswordModal from '@/components/ChangePasswordModal.vue';
  import { openModal } from '@/utils';

  const user = useUser();
  const auth = useAuth();
  const alerts = useAlerts();
  const disabledInputs = [ref(true), ref(true), ref(true)];

  /**
   * Deletes the user account
   */
  async function deleteAccount() {
    const shouldDelete = await ask(
      'Account löschen',
      `Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann <b>nicht rückgängig</b> gemacht werden.`,
      'Löschen',
    );

    if (!shouldDelete) {
      return;
    }

    await auth.delete();
  }

  /**
   * Edits the user data (organization, name or email)
   * @param index The index of the changed data (0 = organization, 1 = name, 2 = email)
   */
  async function edit(index: number) {
    disabledInputs[index].value = !disabledInputs[index].value;
    if (disabledInputs[index].value) {
      const result = await auth.changeAccountData();
      if (result) {
        alerts.success('Eintrag wurde erfolgreich geändert');
      } else {
        alerts.error(
          'Eintrag konnte nicht geändert werden',
          new Error('Eintrag konnte nicht geändert werden'),
        );
      }
    }
  }

  /**
   * Opens the change password modal
   */
  function openChangePasswordModal() {
    openModal('change-password-modal');
  }
</script>
