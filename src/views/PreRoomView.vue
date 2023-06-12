<template>
  <GuestLayout>
    <div class="d-flex justify-content-center mb-4">
      <div style="width: 400px">
        <img
          src="https://placehold.co/400x300.png?text=Kamera+Bild"
          alt=""
          class="rounded"
        />
        <div class="btn-group py-1 w-100">
          <button class="btn btn-secondary">
            <i class="fa fa-video me-1"></i>
            Kamera
          </button>
          <button class="btn btn-secondary">
            <i class="fa fa-microphone me-1"></i>
            Mikrofon
          </button>
        </div>
      </div>
    </div>

    <Input
      label="Gib deinen Namen ein"
      v-model="form.name"
      :error="form.errors.name"
    />

    <button class="btn btn-primary w-100" @click="submit">
      Raum {{ name }} Beitreten
    </button>
  </GuestLayout>
</template>

<script setup lang="ts">
  import GuestLayout from '@/components/GuestLayout.vue';
  import Input from '@/components/inputs/Input.vue';
  import { useChannel } from '@/composables/channel';
  import { computed } from 'vue';
  import { useForm } from '@/composables/form';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const channel = useChannel();

  const name = computed(() => {
    if (channel.state.channelId) {
      return channel.state.channelId.substring(0, 6) + '...';
    }

    return '';
  });

  const form = useForm({
    name: '',
  });

  async function submit() {
    if (!form.name) {
      form.errors.name = 'Bitte gib deinen Namen ein';
      return;
    }

    form.clearErrors();
    await channel.changeName(form.name);
    await router.push(`/room/${channel.state.channelId}`);
  }
</script>
