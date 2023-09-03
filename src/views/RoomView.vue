<template>
  <main class="container-fluid h-100">
    <div class="row h-100">
      <div class="col-9 position-relative h-100 d-flex flex-column">
        <nav
          class="navbar bg-body-tertiary px-2 mt-2 sticky-top rounded shadow-sm"
        >
          <div class="container">
            <router-link
              class="navbar-brand d-flex align-items-center"
              :to="auth.isLoggedIn ? '/dashboard' : '/'"
            >
              <img src="@/assets/icon-logo.png" alt="CollabSpace" height="36" />
            </router-link>
          </div>
        </nav>

        <div class="d-flex flex-grow-1 p-3 overflow-hidden">
          <BrowserComponent />
        </div>
        <div id="open-whiteboard">
          <button class="btn btn-secondary" @click="toggleWhiteboard">
            Whiteboard
          </button>
        </div>
        <div id="open-notes">
          <button class="btn btn-secondary" @click="toggleNotes">
            Notizen
          </button>
        </div>
        <div
          id="whiteboard-wrapper"
          :class="{ hide: !showWhiteboard, expand: expandWhiteboard }"
        >
          <Whiteboard
            @close="toggleWhiteboard"
            @expand="toggleExpandWhiteboard"
            :width="width"
            :height="height"
            :whiteboard="channel.state.whiteboard as WhiteboardComposable"
          />
        </div>
        <div id="notes-wrapper" :class="{ hide: !showNotes }">
          <Notes @close="toggleNotes" />
        </div>
      </div>
      <div
        class="col-3 py-3 bg-dark d-flex flex-column justify-content-between"
        style="max-height: 100%"
      >
        <div
          class="d-flex flex-column justify-content-between p-2 rounded mb-3 bg-primary bg-opacity-10"
        >
          <h3 class="text-primary mt-0 mb-3 text-truncate">
            {{ channel.state.room?.name }}
          </h3>

          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary btn-sm w-100"
              v-if="
                channel.state.teacher && channel.isSelf(channel.state.teacher)
              "
              @click="closeChannel"
            >
              <i class="fa fa-ban me-1"></i>
              Schließen
            </button>
            <button
              class="btn btn-outline-primary btn-sm w-100"
              v-if="channel.isStudent(channel.currentUser())"
              @click="leaveChannel"
            >
              <i class="fa fa-sign-out me-1"></i>
              Verlassen
            </button>
            <button
              class="btn btn-outline-primary btn-sm w-100"
              data-bs-toggle="modal"
              data-bs-target="#share-link-modal"
            >
              <i class="fa fa-link me-1"></i>
              Teilen
            </button>
            <button
              v-if="
                channel.state.teacher && channel.isSelf(channel.state.teacher)
              "
              class="btn btn-outline-primary btn-sm"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fa fa-gear"></i>
            </button>

            <ul class="dropdown-menu">
              <li>
                <button
                  class="dropdown-item"
                  @click="channel.toggleGlobalMute()"
                  v-text="
                    !channel.state.settings.globalMute
                      ? 'Schüler stummschalten'
                      : 'Stummschaltung aufheben'
                  "
                ></button>
              </li>
            </ul>
          </div>

          <small
            v-if="channel.state.settings.globalMute"
            class="text-warning mt-2"
          >
            <i class="fa fa-circle-exclamation me-1"></i>
            Alle Schüler sind stummgeschaltet
          </small>
        </div>

        <div
          id="webcam-wrapper"
          class="d-grid gap-2 overflow-y-auto"
          style="grid-template-columns: repeat(2, minmax(0, 1fr))"
        >
          <template v-if="channel.state.teacher">
            <div
              class="card my-1"
              :class="channel.isSelf(channel.state.teacher) ? 'bg-primary' : ''"
            >
              <Camera :user-id="channel.state.teacher.id" />
              <div class="card-body py-1 px-2">
                <div
                  class="card-text text-dark text-decoration-none d-flex align-items-center flex-wrap"
                >
                  <span
                    :title="channel.state.teacher?.user.name"
                    class="text-truncate"
                  >
                    {{ channel.state.teacher?.user.name }}
                  </span>
                  <span class="flex-grow-1"></span>
                  <span
                    class="badge ms-1"
                    :class="
                      channel.isSelf(channel.state.teacher)
                        ? 'text-bg-light'
                        : 'text-bg-primary'
                    "
                    :title="
                      channel.state.teacher?.user.name + ' ist der Lehrer'
                    "
                  >
                    <i class="fa-solid fa-chalkboard-user"></i>
                  </span>
                  <span
                    v-if="!channel.state.teacher.audio"
                    class="badge text-bg-secondary ms-1"
                    :title="
                      channel.state.teacher?.user.name +
                      ' hat sein Mikrofon deaktiviert'
                    "
                  >
                    <i class="fas fa-microphone-slash"></i>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template v-for="student in channel.state.students" :key="student.id">
            <div
              class="card my-1 d-flex flex-column"
              :class="channel.isSelf(student) ? 'bg-primary' : ''"
            >
              <div class="position-relative flex-grow-1">
                <div class="ratio ratio-4x3">
                  <Camera :user-id="student.id" class="w-100 h-100" />
                </div>

                <div
                  v-if="channel.isTeacher(channel.currentUser())"
                  class="dropdown position-absolute top-0 end-0"
                >
                  <button
                    id="custom-button"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa fa-xs fa-ellipsis-v"></i>
                  </button>

                  <ul class="dropdown-menu">
                    <li @click="updatePermission(student.id)">
                      <button class="dropdown-item">Zugriff ändern</button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="card-body py-1 px-2">
                <div
                  class="card-text text-dark text-decoration-none d-flex align-items-center flex-wrap"
                >
                  <span :title="student.name" class="text-truncate">
                    {{ student.name }}
                  </span>

                  <span class="flex-grow-1"></span>
                  <span
                    v-if="!student.permission"
                    class="badge text-bg-secondary ms-1"
                    :title="student.name + ' hat aktuell keine Berechtigung'"
                  >
                    <i class="fa fa-sm fa-lock"></i>
                  </span>
                  <span
                    v-if="!student.audio"
                    class="badge text-bg-secondary ms-1"
                    :title="student.name + ' hat sein Mikrofon deaktiviert'"
                  >
                    <i class="fa fa-sm fa-microphone-slash"></i>
                  </span>
                  <span
                    v-if="student.handSignal"
                    class="badge text-bg-secondary ms-1"
                    :title="student.name + ' hat ein Handzeichen gegeben'"
                  >
                    <i class="fas fa-hand-paper"></i>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <span class="flex-grow-1"></span>
        <div class="pt-2">
          <div class="d-flex gap-2 justify-content-evenly">
            <button
              type="button"
              class="btn text-primary w-100"
              @click="toggleHandSignal()"
              v-if="channel.isStudent(channel.currentUser())"
            >
              <i
                v-if="
                    (channel.currentUser() as Student).handSignal
                  "
                class="fa fa-hand-rock"
              ></i>
              <i v-else class="fa fa-hand-paper"></i>
            </button>

            <button
              type="button"
              class="btn w-100"
              :class="
                channel.state.settings.globalMute &&
                channel.isStudent(channel.currentUser())
                  ? 'text-danger'
                  : 'text-primary'
              "
              @click="toggleAudio()"
            >
              <i
                v-if="channel.currentUser().audio"
                class="fa fa-microphone"
              ></i>
              <i v-else class="fa fa-microphone-slash"></i>
            </button>
            <button
              type="button"
              class="btn text-primary w-100"
              @click="toggleVideo()"
            >
              <i v-if="channel.currentUser().video" class="fa fa-video"></i>
              <i v-else class="fa fa-video-slash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <ShareLinkModal :channel="channel.state as ChannelState" />
</template>

<script setup lang="ts">
  import {
    ChannelState,
    Student,
    useChannel,
  } from '@/composables/channel/channel';
  import { useAuth } from '@/composables/auth';
  import Camera from '@/components/Camera.vue';
  import ShareLinkModal from '@/components/ShareLinkModal.vue';
  import Whiteboard from '@/components/Whiteboard.vue';
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import { Whiteboard as WhiteboardComposable } from '@/composables/channel/whiteboard';
  import Notes from '@/components/Notes.vue';
  import BrowserComponent from '@/components/Browser.vue';
  import { ask } from '@/composables/prompt';
  import { useRouter } from 'vue-router';
  import { useAlerts } from '@/composables/alerts';

  const alerts = useAlerts();
  const auth = useAuth();
  const channel = useChannel();
  const router = useRouter();

  const showWhiteboard = ref(false);
  const expandWhiteboard = ref(false);

  const showNotes = ref(false);

  const width = ref(0);
  const height = ref(0);

  onMounted(() => {
    window.addEventListener('resize', updateWhiteboardSize);
    document.documentElement.style.overflowY = 'hidden';
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWhiteboardSize);
    document.documentElement.style.overflowY = '';

    channel.webcam.stop();

    if (auth.isLoggedIn) {
      channel.leaveAsTeacher();
    } else {
      channel.leave();
    }
  });

  channel.loadWebcams();

  /**
   * Function that redirects the user to the home page. The logic
   * for leaving the channel is handled by the 'onBeforeUnmount()' hook.
   */
  async function leaveChannel() {
    const shouldLeave = await ask(
      'Raum verlassen',
      `Willst du den Raum <b>${truncatedRoomName()}</b> wirklich verlassen?`,
      'Verlassen',
    );

    if (!shouldLeave) {
      return;
    }
    router.push('/');
  }

  /**
   * Function that updates the 'width' and 'height' values based on the client width and height of the "whiteboard-wrapper" element.
   * It retrieves the client width and height using 'document.getElementById()', and updates the 'width' and 'height' values accordingly.
   */
  function updateWhiteboardSize() {
    width.value =
      document.getElementById('whiteboard-wrapper')?.clientWidth || 0;
    height.value =
      document.getElementById('whiteboard-wrapper')?.clientHeight || 0;
  }

  /**
   * Function that toggles the video transmission status through the channel using 'channel.toggleVideo()'.
   */
  function toggleVideo() {
    channel.webcam.toggleVideo();
  }

  /**
   * Function that toggles the audio transmission status through the channel using 'channel.toggleAudio()'.
   */
  function toggleAudio() {
    if (
      channel.state.settings.globalMute &&
      channel.isStudent(channel.currentUser())
    ) {
      alerts.danger(
        'Du kannst dein Mikrofon nicht aktivieren',
        'Der Lehrer hat alle Mikrofone deaktiviert.',
      );

      return;
    }

    channel.webcam.toggleAudio();
  }

  /**
   * Function that toggles the hand signal through the channel using 'channel.toggleHandSignal()'.
   */
  function toggleHandSignal() {
    channel.toggleHandSignal();
  }

  /**
   * Function that updates the permission of a student with the provided 'studentId' through the channel using 'channel.updatePermission()'.
   * @param studentId - The ID of the student whose permission is to be updated.
   */
  function updatePermission(studentId: string) {
    channel.updatePermission(studentId);
  }

  /**
   * Function that toggles the visibility of the whiteboard. If the notes are visible, it will also toggle the notes using 'toggleNotes()'.
   * It updates the 'showWhiteboard.value' and sets a timeout to call 'updateWhiteboardSize()' after 50 milliseconds.
   */
  function toggleWhiteboard() {
    if (showNotes.value) {
      toggleNotes();
    }
    showWhiteboard.value = !showWhiteboard.value;

    setTimeout(() => {
      updateWhiteboardSize();
    }, 50);
  }

  /**
   * Function that toggles the expanded view of the whiteboard and sets a timeout to call 'updateWhiteboardSize()' after 50 milliseconds.
   * It updates the 'expandWhiteboard.value'.
   */
  function toggleExpandWhiteboard() {
    expandWhiteboard.value = !expandWhiteboard.value;

    setTimeout(() => {
      updateWhiteboardSize();
    }, 50);
  }

  /**
   * Function that toggles the visibility of the notes. If the whiteboard is visible, it will also toggle the whiteboard using 'toggleWhiteboard()'.
   * It updates the 'showNotes.value'.
   */
  function toggleNotes() {
    if (showWhiteboard.value) {
      toggleWhiteboard();
    }
    showNotes.value = !showNotes.value;
  }

  /**
   * Close the channel. This will remove all students from the channel and close the channel.
   */
  async function closeChannel() {
    const shouldClose = await ask(
      'Raum schließen',
      `Soll der Raum <b>${truncatedRoomName()}</b> wirklich geschlossen werden? Alle Schüler werden aus dem Raum entfernt.`,
      'Schließen',
    );

    if (!shouldClose) {
      return;
    }

    channel.close(channel.state.channelId);
  }

  /**
   * Function that returns the truncated room name if it is longer than 20 characters.
   */
  function truncatedRoomName() {
    const roomName = channel.state.room?.name;
    return roomName && roomName.length > 20
      ? roomName.substring(0, 20) + '...'
      : roomName;
  }
</script>

<style lang="scss" scoped>
  #open-whiteboard {
    position: absolute;
    bottom: 1rem;
    left: 50%;
  }

  #open-notes {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-50%);
  }

  #whiteboard-wrapper {
    position: absolute;
    bottom: 1rem;
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
    height: 30%;
    min-height: 250px;
    overflow: hidden;
    z-index: 1040;

    &.hide {
      visibility: hidden;
    }

    &.expand {
      height: calc(100% - 2rem);
      width: calc(100% - 2rem);
      bottom: 50%;
      left: 50%;
      transform: translate(-50%, 50%);
    }
  }

  #notes-wrapper {
    position: absolute;
    left: 1rem;
    top: 50%;
    height: calc(100% - 2rem);
    width: 30%;
    transform: translateY(-50%);
    max-width: 350px;
    min-width: 250px;
    z-index: 1040;

    &.hide {
      visibility: hidden;
    }
  }

  #custom-button {
    width: 27px;
    height: 27px;
    margin: 3px;
    padding: 0;
    background: rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 9px;
    color: white;
  }

  #webcam-wrapper {
    scrollbar-color: #999 #333;
  }

  #webcam-wrapper::-webkit-scrollbar {
    width: 10px;
  }

  #webcam-wrapper::-webkit-scrollbar-thumb {
    background: #999;
    border-radius: 12px;
    margin: 1rem;
  }

  #webcam-wrapper::-webkit-scrollbar-track {
    background: #333;
    border-radius: 12px;
  }
</style>
