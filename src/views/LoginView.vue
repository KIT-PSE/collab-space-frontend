<template>
  <GuestLayout>
    <EmailInput
      label="E-Mail Adresse"
      v-model="email"
      :invalid="emailInvalid"
    />
    <PasswordInput
      label="Passwort"
      v-model="password"
      :invalid="passwordInvalid"
    />

    <button class="btn btn-primary w-100" @click="login">Anmelden</button>

    <router-link
      to="/register"
      class="mt-5 text-center text-secondary text-decoration-none d-block"
    >
      Noch keinen Account? Jetzt registrieren
    </router-link>
  </GuestLayout>
</template>

<script setup lang="ts">
  import EmailInput from '@/components/inputs/EmailInput.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import GuestLayout from '@/components/GuestLayout.vue';
  import { ref } from 'vue';
  import { useAuth } from '@/composables/auth';

  const auth = useAuth();

  const email = ref('test@example.com');
  const emailInvalid = ref(false);
  const password = ref('12345');
  const passwordInvalid = ref(false);

  async function login() {
    emailInvalid.value = !email.value;
    passwordInvalid.value = !password.value;

    if (emailInvalid.value || passwordInvalid.value) {
      return;
    }

    await auth.login(email.value, password.value);
  }
</script>
