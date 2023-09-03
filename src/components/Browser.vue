<template>
  <div
    id="outer-wrapper"
    class="d-flex flex-column align-items-center justify-content-center w-100 h-100"
  >
    <div
      id="inner-wrapper"
      class="overflow-hidden border border-primary-subtle rounded"
      :class="{
        'd-none': !isStreaming,
      }"
    >
      <div
        class="d-flex align-items-center p-2 bg-white border-bottom border-primary-subtle"
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
        <div class="d-flex align-items-stretch w-100 ms-2">
          <span class="py-1 pe-1 ps-2 rounded-start bg-body-secondary h-100">
            https://
          </span>
          <input
            class="m-0 py-1 ps-1 pe-2 bg-primary-subtle bg-opacity-25 rounded-end flex-grow-1 border-0 text-dark"
            v-model="channel.browser.url"
            style="outline-color: #34d1b3"
          />
        </div>
        <button
          v-if="isTeacher"
          @click="openWebsite"
          class="ms-2 btn btn-secondary btn-sm"
        >
          Öffnen
        </button>
        <button
          v-if="isTeacher"
          @click="closeBrowser"
          :disabled="!isStreaming"
          class="btn btn-sm ms-2"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <video
        v-show="isStreaming"
        autoplay
        ref="browserVideo"
        class="w-100"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
        @wheel="onWheel"
        tabindex="0"
      ></video>
    </div>

    <div
      v-if="!isStreaming && !isTeacher"
      class="d-flex flex-column align-items-center"
    >
      <i class="fa fa-xl fa-chalkboard-user"></i>
      <p class="mt-3">Warte, bis der Lehrer eine Website geteilt hat.</p>
    </div>

    <div v-if="!isStreaming && isTeacher" class="d-flex flex-column w-100">
      <h4 class="text-center">Website teilen</h4>
      <p class="text-center">
        Gib die URL der Website ein, die du teilen möchtest.
      </p>
      <div class="d-flex justify-content-center w-full">
        <div
          class="d-flex align-items-stretch flex-grow-1"
          style="max-width: 350px"
        >
          <span class="py-1 pe-1 ps-2 rounded-start bg-body-secondary h-100">
            https://
          </span>
          <input
            class="m-0 py-1 ps-1 pe-2 bg-primary-subtle bg-opacity-25 rounded-end flex-grow-1 border-0 text-dark w-100"
            v-model="channel.browser.url"
            style="outline-color: #34d1b3"
          />
        </div>
        <button
          v-if="isTeacher"
          @click="openWebsite"
          class="ms-2 btn btn-secondary btn-sm"
        >
          Öffnen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useThrottleFn } from '@vueuse/core';
  import { useChannel } from '@/composables/channel/channel';

  const browserVideo = ref<HTMLVideoElement | null>(null);

  const channel = useChannel();
  const isTeacher = computed(() => !channel.isStudent(channel.currentUser()));

  const isStreaming = ref(false);

  const TARGET_BROWSER_WIDTH = 1920;
  const TARGET_BROWSER_HEIGHT = 1080;

  onMounted(() => {
    window.addEventListener('resize', calcDimensions);
    calcDimensions();
    channel.browser.loadBrowserStream();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', calcDimensions);
  });

  /**
   * Opens the website specified in the `website.value` variable using the browser channel.
   */
  function openWebsite() {
    channel.browser.openWebsite(channel.browser.url);
  }

  /**
   * Closes the currently opened website using the browser channel. It also resets the streaming and video source.
   */
  function closeBrowser() {
    channel.browser.closeBrowser();
    isStreaming.value = false;
    browserVideo.value!.srcObject = null;
  }

  /**
   * Throttled function that handles mouse movement events while streaming is active and the user has permission.
   * @param {MouseEvent} event - The mouse move event object.
   */
  const onMouseMove = useThrottleFn((event: MouseEvent) => {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }
    const { x: targetX, y: targetY } = getAdjustedMousePosition(event);
    channel.browser.moveMouse(targetX, targetY);
  }, 50);

  /**
   * Handles the `mousedown` event on the browser video element.
   * @param event - The mouse down event object.
   */
  function onMouseDown(event: MouseEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    channel.browser.mouseDown();
  }

  /**
   * Handles the `mouseup` event on the browser video element.
   * @param event - The mouse up event object.
   */
  function onMouseUp(event: MouseEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    channel.browser.mouseUp();
  }

  /**
   * Handles the `keydown` event on the document.
   * @param  event - The key down event object.
   */
  function onKeyDown(event: KeyboardEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.keyDown(event.key);
  }

  /**
   * Handles the `keyup` event on the document.
   * @param event - The key up event object.
   */
  function onKeyUp(event: KeyboardEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.keyUp(event.key);
  }

  /**
   * Handles the `wheel` event on the browser video element.
   * @param event - The wheel event object.
   */
  function onWheel(event: WheelEvent) {
    if (!isStreaming.value || !channel.hasCurrentUserPermission) {
      return;
    }

    channel.browser.scroll(event.deltaY);
  }

  /**
   * Reloads the currently opened website using the browser channel.
   */
  function reload() {
    channel.browser.reload();
  }

  /**
   * Navigates back in the browser history using the browser channel.
   */
  function navigateBack() {
    channel.browser.navigateBack();
  }

  /**
   * Navigates forward in the browser history using the browser channel.
   */
  function navigateForward() {
    channel.browser.navigateForward();
  }

  /**
   * Calculates the adjusted mouse position relative to the browser video element.
   * It takes into account the size of the element and the target browser dimensions.
   * @param event - The mouse event object.
   * @returns The adjusted mouse position with `x` and `y` coordinates.
   */
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

  /**
   * Watches changes in the `channel.browser.browserStream` and updates the `isStreaming.value` and `browserVideo.value!.srcObject` accordingly.
   * @param stream - The browser stream object or null if the stream has ended.
   */
  watch(
    () => channel.browser.browserStream,
    (stream) => {
      if (stream) {
        isStreaming.value = true;
        browserVideo.value!.srcObject = stream;
      } else {
        isStreaming.value = false;
        browserVideo.value!.srcObject = null;
      }
    },
  );

  function calcDimensions() {
    // outerWrapper defines the available space
    const outerWrapper = document.getElementById('outer-wrapper');
    // innerWrapper will be resized to fit the available space
    const innerWrapper = document.getElementById('inner-wrapper');
    const headerHeight = 50;
    const videoAspectRatio = 16 / 9;

    const availableWidth = outerWrapper!.offsetWidth;
    const availableHeight = outerWrapper!.offsetHeight;

    let width = availableWidth;
    let height = availableHeight - headerHeight;

    if (width / height > videoAspectRatio) {
      width = height * videoAspectRatio;
    } else {
      height = width / videoAspectRatio;
    }

    innerWrapper!.style.width = `${width}px`;
    innerWrapper!.style.height = `${height + headerHeight}px`;

    browserVideo.value!.style.width = `${width}px`;
    browserVideo.value!.style.height = `${height}px`;
  }
</script>
