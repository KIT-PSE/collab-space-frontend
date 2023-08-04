<template>
  <GuestLayout>
    <p class="my-5 text-secondary">
      Um einen Raum zu betreten, benötigst du den eindeutigen 6-stelligen Code
      für diesen Raum. Den Code bekommst du von dem Ersteller des Raumes.
      Alternativ kann dieser auch einen Link mit dir teilen über welchen du
      direkt in den Raum beitreten kannst.
    </p>

    <Input
      label="Code eingeben"
      v-model="form.code"
      :error="form.errors.code"
    />

    <Input
      v-if="showPassword"
      label="Passwort"
      v-model="form.password"
      :error="form.errors.password"
    />

    <button class="btn btn-primary w-100" @click="submit">Beitreten</button>

    <router-link
      to="/login"
      class="mt-5 text-center text-secondary text-decoration-none d-block"
    >
      Du bist ein Lehrer? Jetzt anmelden
    </router-link>
  </GuestLayout>
</template>

<script setup lang="ts">
  import GuestLayout from '@/components/GuestLayout.vue';
  import Input from '@/components/inputs/Input.vue';
  import { useChannel } from '@/composables/channel/channel';
  import { useForm } from '@/composables/form';
  import { useRouter } from 'vue-router';
  import { onMounted, ref } from 'vue';

  const channel = useChannel();
  const router = useRouter();

  const form = useForm({
    code: router.currentRoute.value.query.code ?? '',
    password: router.currentRoute.value.query.password ?? '',
  });

  const showPassword = ref(
    router.currentRoute.value.query.password &&
      router.currentRoute.value.query.password !== '',
  );

  onMounted(() => {
    if (form.code) {
      submit();
    }
  });

  async function submit() {
    try {
      await channel.joinAsStudent(form.code as string, form.password as string);
      form.clearErrors();
      await router.push(`/room/${form.code}/connecting`);
    } catch (e) {
      const error = e as string;
      if (error === 'Wrong password') {
        if (showPassword.value) {
          form.errors.password = 'Das Passwort ist falsch.';
        } else {
          showPassword.value = true;
        }
      } else {
        form.errors.code = error;
      }
    }
  }
</script>
