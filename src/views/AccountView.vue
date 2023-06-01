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
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import Input from '@/components/inputs/Input.vue';
  import EmailInput from '@/components/inputs/EmailInput.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import { useUser } from '@/composables/auth';

  const user = useUser();
</script>
