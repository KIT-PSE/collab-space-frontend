<template>
  <div
    class="border border-primary-subtle rounded overflow-hidden d-flex flex-column"
  >
    <div
      class="d-flex align-items-center p-2 border-bottom border-primary-subtle sticky-top"
    >
      <button @click="reload" :disabled="!isStreaming" class="btn btn-sm">
        <i class="fas fa-sync"></i>
      </button>
      <button
        @click="navigateBack"
        :disabled="!isStreaming"
        class="btn btn-sm ms-2"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
      <button
        @click="navigateForward"
        :disabled="!isStreaming"
        class="btn btn-sm ms-2"
      >
        <i class="fas fa-arrow-right"></i>
      </button>
      <input
        class="m-0 ms-2 py-1 px-3 bg-primary-subtle bg-opacity-25 rounded flex-grow-1 border-0 text-dark"
        v-model="channel.browser.url"
        style="outline-color: #34d1b3"
      />
      <button
        v-if="isTeacher"
        @click="openWebsite"
        class="ms-2 btn btn-secondary btn-sm"
      >
        Öffnen
      </button>
      <button
        v-if="isTeacher"
        @click="closeWebsite"
        :disabled="!isStreaming"
        class="btn btn-sm ms-2"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div
      v-if="!isStreaming"
      style="aspect-ratio: 16 / 9; width: 100%"
      class="w-100 d-flex justify-content-center align-items-center"
    >
      <p class="text-center text-body-secondary h4">
        Warte bis der Lehrer eine Website geteilt hat.
      </p>
    </div>
    <video
      v-show="isStreaming"
      src="https://placehold.co/1920x1080.mp4?text=eingebettete+Webseite"
      autoplay
      ref="browserVideo"
      style="aspect-ratio: 16 / 9; width: 100%; max-height: 100%"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @wheel="onWheel"
      tabindex="0"
    ></video>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useThrottleFn } from '@vueuse/core';
  import { useChannel } from '@/composables/channel/channel';

  const browserVideo = ref<HTMLVideoElement | null>(null);

  const channel = useChannel();
  const isTeacher = computed(() => !channel.isStudent(channel.currentUser()));

  const isStreaming = ref(false);

  const TARGET_BROWSER_WIDTH = 1920;
  const TARGET_BROWSER_HEIGHT = 1080;

  onMounted(() => {
    channel.browser.loadBrowserStream();
  });

  function openWebsite() {
    channel.browser.openWebsite(channel.browser.url);
  }

  function closeWebsite() {
    channel.browser.closeWebsite();
    isStreaming.value = false;
    browserVideo.value!.srcObject = null;
  }

  const onMouseMove = useThrottleFn((event: MouseEvent) => {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }
    const { x: targetX, y: targetY } = getAdjustedMousePosition(event);
    channel.browser.moveMouse(targetX, targetY);
  }, 50);

  function onMouseDown(event: MouseEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    channel.browser.mouseDown();
  }

  function onMouseUp(event: MouseEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    channel.browser.mouseUp();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.keyDown(event.key);
  }

  function onKeyUp(event: KeyboardEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.keyUp(event.key);
  }

  function onWheel(event: WheelEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.scroll(event.deltaY);
  }

  function reload() {
    channel.browser.reload();
  }

  function navigateBack() {
    channel.browser.navigateBack();
  }

  function navigateForward() {
    channel.browser.navigateForward();
  }

  function getAdjustedMousePosition(event: MouseEvent) {
    const element = browserVideo.value!;
    const rect = element.getBoundingClientRect();

    const offsetX = element.offsetLeft;
    const offsetY = element.offsetTop;

    const targetX = Math.min(
      Math.max(
        (event.clientX - offsetX!) * (TARGET_BROWSER_WIDTH / rect.width),
        0,
      ),
      TARGET_BROWSER_WIDTH,
    );

    const targetY = Math.min(
      Math.max(
        (event.clientY - offsetY!) * (TARGET_BROWSER_HEIGHT / rect.height),
        0,
      ),
      TARGET_BROWSER_HEIGHT,
    );

    return { x: targetX, y: targetY };
  }

  watch(
    () => channel.browser.browserStream,
    (stream) => {
      console.log(stream);
      if (stream) {
        isStreaming.value = true;
        browserVideo.value!.srcObject = stream;
      } else {
        isStreaming.value = false;
        browserVideo.value!.srcObject = null;
      }
    },
  );
</script>
