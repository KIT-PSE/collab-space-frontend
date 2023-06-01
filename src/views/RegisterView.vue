<template>
  <GuestLayout>
    <Input label="Schule / Universität oder Organisation" />
    <Input label="Name" />
    <EmailInput label="E-Mail Adresse" />
    <PasswordInput label="Passwort" />
    <PasswordInput label="Passwort wiederholen" />

    <button class="btn btn-primary w-100">Registrieren</button>

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
</script>
