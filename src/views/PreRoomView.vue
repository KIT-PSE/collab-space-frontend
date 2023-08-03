<template>
  <GuestLayout>
    <div class="d-flex justify-content-center mb-4">
      <div style="width: 400px">
        <!--        <img-->
        <!--          src="https://placehold.co/400x300.png?text=Kamera+Bild"-->
        <!--          alt=""-->
        <!--          class="rounded"-->
        <!--        />-->
        <video autoplay ref="videoElement" class="rounded" width="400"></video>
        <div class="btn-group py-1 w-100">
          <button class="btn btn-secondary" @click="toggleVideo()">
            <i v-if="video" class="fa fa-video me-1"></i>
            <i v-else class="fa fa-video-slash me-1"></i>
            Kamera
          </button>
          <button class="btn btn-secondary" @click="toggleAudio()">
            <i v-if="audio" class="fa fa-microphone me-1"></i>
            <i v-else class="fa fa-microphone-slash me-1"></i>
            Mikrofon
          </button>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center">
      <div class="flex-grow-1">
        <Input
          label="Gib deinen Namen ein"
          v-model="form.name"
          :error="form.errors.name"
          :disabled="savedUserName !== ''"
        />
      </div>
      <button
        v-if="savedUserName !== ''"
        class="btn btn-outline-primary ms-2 mt-3"
        @click="resetName"
      >
        Nicht du?
      </button>
    </div>

    <button class="btn btn-primary w-100" @click="submit">
      Raum "{{ channel.state.room?.name }}" beitreten
    </button>
  </GuestLayout>
</template>

<script setup lang="ts">
  import GuestLayout from '@/components/GuestLayout.vue';
  import Input from '@/components/inputs/Input.vue';
  import { useChannel } from '@/composables/channel/channel';
  import { onMounted, ref } from 'vue';
  import { useForm } from '@/composables/form';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const channel = useChannel();

  const savedUserName = ref(localStorage.getItem('session-name') || '');

  const form = useForm({
    name: savedUserName.value,
  });

  const videoElement = ref<HTMLVideoElement | null>(null);
  let stream: MediaStream | undefined;

  onMounted(async () => {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoElement.value!.srcObject = stream;
  });

  const video = ref(true);
  const audio = ref(true);

  function toggleVideo() {
    video.value = !video.value;
    channel.state.webcam?.toggleVideo();
    stream!.getVideoTracks().forEach((track) => (track.enabled = video.value));
  }

  function toggleAudio() {
    audio.value = !audio.value;
    channel.state.webcam?.toggleAudio();
    stream!.getAudioTracks().forEach((track) => (track.enabled = audio.value));
  }

  async function submit() {
    if (!form.name) {
      form.errors.name = 'Bitte gib deinen Namen ein';
      return;
    }

    form.clearErrors();
    await channel.changeName(form.name);
    await router.push(`/room/${channel.state.channelId}`);
  }

  function resetName() {
    localStorage.removeItem('session-name');
    savedUserName.value = '';
    form.name = '';
  }
</script>
