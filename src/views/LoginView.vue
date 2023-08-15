<template>
  <GuestLayout>
    <EmailInput
      label="E-Mail Adresse"
      v-model="form.email"
      :error="form.errors.email"
      autocomplete="email"
    />

    <PasswordInput
      label="Passwort"
      v-model="form.password"
      :error="form.errors.password"
      autocomplete="current-password"
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
  import { useAuth } from '@/composables/auth';
  import { useForm } from '@/composables/form';

  const auth = useAuth();

  const form = useForm({
    email: import.meta.env.DEV ? 'test@example.com' : '',
    password: import.meta.env.DEV ? '12345' : '',
  });

  /**
   * Function that initiates the login process by submitting the login form data to the 'auth.login()' method.
   * The 'form.submit()' method is used to send the login data.
   */
  function login() {
    form.submit((data) => auth.login(data));
  }
</script>
