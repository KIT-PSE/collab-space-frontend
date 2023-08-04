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

  /**
   * Function that toggles the video status for the current user.
   * It updates the 'video' value, calls 'channel.toggleVideo()' to toggle video transmission through the channel,
   * and enables/disables the video tracks in the local media stream accordingly.
   */
  function toggleVideo() {
    video.value = !video.value;
    channel.toggleVideo();
    stream!.getVideoTracks().forEach((track) => (track.enabled = video.value));
  }

  /**
   * Function that toggles the audio status for the current user.
   * It updates the 'audio' value, calls 'channel.toggleAudio()' to toggle audio transmission through the channel,
   * and enables/disables the audio tracks in the local media stream accordingly.
   */
  function toggleAudio() {
    audio.value = !audio.value;
    channel.toggleAudio();
    stream!.getAudioTracks().forEach((track) => (track.enabled = audio.value));
  }

  /**
   * Asynchronous function that handles the submission process when the user changes their name.
   * It checks if the user has provided a name, and if not, it sets an error message.
   * Otherwise, it calls 'channel.changeName()' to update the user's name and navigates to the room
   * with the updated name using 'router.push()'.
   */
  async function submit() {
    if (!form.name) {
      form.errors.name = 'Bitte gib deinen Namen ein';
      return;
    }

    form.clearErrors();
    await channel.changeName(form.name);
    await router.push(`/room/${channel.state.channelId}`);
  }

  /**
   * Function that resets the user's name by removing it from the local storage
   * and clearing the 'form.name' and 'savedUserName.value'.
   */
  function resetName() {
    localStorage.removeItem('session-name');
    savedUserName.value = '';
    form.name = '';
  }
</script>
