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

  const channel = useChannel();
  const router = useRouter();

  const form = useForm({
    code: '',
  });

  async function submit() {
    try {
      await channel.joinAsStudent(form.code);
      form.clearErrors();
      await router.push(`/room/${form.code}/connecting`);
    } catch (err) {
      form.errors.code = err as string;
    }
  }
</script>
