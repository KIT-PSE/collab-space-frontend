<template>
  <video
    autoplay
    ref="video"
    class="rounded"
    :muted="channel.isSelf(userId)"
  ></video>
</template>

<script setup lang="ts">
  import { useChannel } from '@/composables/channel';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    userId: string;
  }>();

  const channel = useChannel();

  const video = ref<HTMLVideoElement | null>(null);
  let loaded = false;

  watch(channel.streams, () => {
    if (loaded) {
      return;
    }

    const stream = channel.getWebcamStream(props.userId);

    if (stream) {
      video.value!.srcObject = stream;
      loaded = true;
    }
  });
</script>
