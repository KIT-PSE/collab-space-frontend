<template>
  <GuestLayout>
    <Input
      label="Schule / Universität oder Organisation"
      v-model="form.organization"
      :error="form.errors.organization"
    />

    <Input label="Name" v-model="form.name" :error="form.errors.name" />

    <EmailInput
      label="E-Mail Adresse"
      v-model="form.email"
      :error="form.errors.email"
    />

    <PasswordInput
      label="Passwort"
      v-model="form.password"
      :error="form.errors.password"
    />

    <PasswordInput
      label="Passwort wiederholen"
      v-model="form.confirmPassword"
      :error="form.errors.confirmPassword"
    />

    <button class="btn btn-primary w-100" @click="register">
      Registrieren
    </button>

    <router-link
      to="/login"
      class="mt-5 text-center text-secondary text-decoration-none d-block"
    >
      Du hast bereits einen Account? Jetzt anmelden
    </router-link>
  </GuestLayout>
</template>

<script setup lang="ts">
  import Input from '@/components/inputs/Input.vue';
  import EmailInput from '@/components/inputs/EmailInput.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import GuestLayout from '@/components/GuestLayout.vue';
  import { useForm } from '@/composables/form';
  import { useAuth } from '@/composables/auth';
  import TestComponent from "@/components/TestComponent.vue";

  const auth = useAuth();

  const form = useForm({
    organization: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  function register() {
    form.submit((data) => auth.register(data));
  }
</script>
