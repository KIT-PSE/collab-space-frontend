<template>
  <Layout title="Account Einstellungen" :buttons="['back']">
    <div class="row">
      <h2 class="mb-4">Account-Daten ändern</h2>

      <div class="col-md-6">
        <Input
          label="Schule / Universität oder Organisation"
          v-model="form.organization"
          :error="form.errors.organization"
          :disabled="!changeOrg"
        >
          <button
            class="btn btn-secondary ms-2"
            @click="changeOrg ? edit() : (changeOrg = true)"
          >
            {{ changeOrg ? 'Speichern' : 'Ändern' }}
          </button>
        </Input>

        <Input
          label="Name"
          v-model="form.name"
          :error="form.errors.name"
          :disabled="!changeName"
          autocomplete="name"
        >
          <button
            class="btn btn-secondary ms-2"
            @click="changeName ? edit() : (changeName = true)"
          >
            {{ changeName ? 'Speichern' : 'Ändern' }}
          </button>
        </Input>

        <EmailInput
          label="E-Mail Adresse"
          v-model="form.email"
          :error="form.errors.email"
          :disabled="!changeEmail"
          autocomplete="email"
        >
          <button
            class="btn btn-secondary ms-2"
            @click="changeEmail ? edit() : (changeEmail = true)"
          >
            {{ changeEmail ? 'Speichern' : 'Ändern' }}
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
  import { computed, ref } from 'vue';
  import { useAlerts } from '@/composables/alerts';
  import ChangePasswordModal from '@/components/ChangePasswordModal.vue';
  import { openModal } from '@/utils';
  import { useForm } from '@/composables/form';
  import { UpdateUser } from '@/composables/api';

  const user = useUser();
  const auth = useAuth();
  const alerts = useAlerts();

  const form = useForm<UpdateUser>({
    organization: user.value.organization,
    name: user.value.name,
    email: user.value.email,
  });

  const changeOrg = ref(false);
  const changeName = ref(false);
  const changeEmail = ref(false);

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

  async function edit() {
    const shouldEdit = await ask(
      'Account Daten aktualisieren',
      `Bist du sicher, dass du deine Account Daten aktualisieren möchtest?`,
      'Aktualisieren',
    );

    if (!shouldEdit) {
      resetForm();
      return;
    }

    const result = await form.submit((data) => auth.updateUser(data));

    if (!result) {
      return;
    }

    resetForm();

    alerts.success('Eintrag wurde erfolgreich geändert');
  }

  function resetForm() {
    form.organization = user.value.organization;
    form.name = user.value.name;
    form.email = user.value.email;

    changeOrg.value = false;
    changeName.value = false;
    changeEmail.value = false;
  }

  /**
   * Opens the change password modal
   */
  function openChangePasswordModal() {
    openModal('change-password-modal');
  }
</script>
