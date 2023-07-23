<template>
  <Layout title="Account Einstellungen" :buttons="['back']">
    <div class="row mt-5">
      <div class="col-md-6">
        <Input
          label="Schule / Universität oder Organisation"
          :model-value="user.organization ?? '-'"
          disabled
        >
          <button class="btn btn-secondary ms-2">Ändern</button>
        </Input>

        <Input label="Name" :model-value="user.name" disabled>
          <button class="btn btn-secondary ms-2">Ändern</button>
        </Input>

        <EmailInput label="E-Mail Adresse" :model-value="user.email" disabled>
          <button class="btn btn-secondary ms-2">Ändern</button>
        </EmailInput>

        <PasswordInput label="Passwort" model-value="12345678" disabled>
          <button class="btn btn-secondary ms-2">Ändern</button>
        </PasswordInput>

        <button class="btn btn-danger mt-3" @click="deleteAccount">
          Account löschen
        </button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import Input from '@/components/inputs/Input.vue';
  import EmailInput from '@/components/inputs/EmailInput.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import { useAuth, useUser } from '@/composables/auth';
  import { ask } from '@/composables/prompt';

  const user = useUser();
  const auth = useAuth();

  async function deleteAccount() {
    const shouldDelete = await ask(
      'Account löschen',
      `Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann <b>nicht rückgängig</b> gemacht werden.`,
      'Löschen',
    );

    if (!shouldDelete) return;

    await auth.delete();
  }
</script>
