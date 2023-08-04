<template>
  <main class="container-fluid h-100">
    <div class="row h-100">
      <div
        class="col-9 d-flex flex-column p-2 gap-4 h-100 overflow-hidden position-relative"
      >
        <div class="row">
          <div class="col d-flex align-items-center">
            <router-link :to="auth.isLoggedIn ? '/dashboard' : '/'">
              <img
                src="@/assets/textless-logo.png"
                alt="CollabSpace"
                width="100"
              />
            </router-link>
          </div>
        </div>

        <div class="overflow-auto flex-grow-1">
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
        <div class="row overflow-y-auto mb-2">
          <div class="d-flex justify-content-between px-4 py-2">
            <h3 class="text-center text-primary mt-2">
              {{ channel.state.room?.name }}
            </h3>

            <div class="d-flex justify-content-center">
              <button
                class="btn btn-outline-primary"
                data-bs-toggle="modal"
                data-bs-target="#share-link-modal"
              >
                <i class="fa fa-link"></i>
                Link teilen
              </button>
            </div>
          </div>

          <div v-if="channel.state.teacher" class="col-lg-6">
            <div
              class="card my-1"
              :class="channel.isSelf(channel.state.teacher) ? 'bg-primary' : ''"
            >
              <Camera :user-id="channel.state.teacher.id" />
              <div class="card-body py-2">
                <div
                  class="card-text text-dark text-decoration-none d-flex align-items-center flex-wrap"
                >
                  {{ channel.state.teacher?.user.name }}
                  <!--<span class="badge text-bg-primary ms-1">Lehrer</span>-->
                  <span class="flex-grow-1"></span>
                  <span
                    class="badge ms-1"
                    :class="
                      channel.isSelf(channel.state.teacher)
                        ? 'text-bg-light'
                        : 'text-bg-primary'
                    "
                  >
                    <i class="fa-solid fa-chalkboard-user"></i>
                  </span>
                  <span
                    v-if="!channel.state.teacher.audio"
                    class="badge text-bg-secondary ms-1"
                  >
                    <i class="fas fa-microphone-slash"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="student in channel.state.students"
            :key="student.id"
            class="col-lg-6"
          >
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
                    class="btn text-white"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa fa-ellipsis-v"></i>
                  </button>

                  <ul class="dropdown-menu">
                    <li @click="updatePermission(student.id)">
                      <button class="dropdown-item">Zugriff ändern</button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="card-body py-2">
                <div class="card-text text-dark text-decoration-none">
                  {{ student.name }}
                  <span
                    v-if="!student.permission"
                    class="badge text-bg-secondary ms-1"
                  >
                    <i class="fas fa-lock"></i>
                  </span>
                  <span
                    v-if="!student.audio"
                    class="badge text-bg-secondary ms-1"
                  >
                    <i class="fas fa-microphone-slash"></i>
                  </span>
                  <span
                    v-if="student.handSignal"
                    class="badge text-bg-secondary ms-1"
                  >
                    <i class="fas fa-hand-paper"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="col d-flex justify-content-center">
            <span v-if="channel.isStudent(channel.currentUser())">
              <button
                type="button"
                class="btn text-primary mx-2"
                @click="toggleHandSignal()"
              >
                <i
                  v-if="
                    (channel.currentUser() as Student).handSignal
                  "
                  class="fa fa-hand-rock"
                ></i>
                <i v-else class="fa fa-hand-paper"></i>
              </button>
            </span>

            <button
              type="button"
              class="btn text-primary mx-2"
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
              class="btn text-primary mx-2"
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

  const auth = useAuth();
  const channel = useChannel();

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

    channel.webcam.stopWebcam();

    if (auth.isLoggedIn) {
      channel.leaveAsTeacher();
    } else {
      channel.leave();
    }
  });

  channel.loadWebcams();

  function updateWhiteboardSize() {
    width.value =
      document.getElementById('whiteboard-wrapper')?.clientWidth || 0;
    height.value =
      document.getElementById('whiteboard-wrapper')?.clientHeight || 0;
  }

  function toggleVideo() {
    channel.webcam.toggleVideo();
  }

  function toggleAudio() {
    channel.webcam.toggleAudio();
  }

  function toggleHandSignal() {
    channel.toggleHandSignal();
  }

  function updatePermission(studentId: string) {
    channel.updatePermission(studentId);
  }

  function toggleWhiteboard() {
    if (showNotes.value) {
      toggleNotes();
    }
    showWhiteboard.value = !showWhiteboard.value;

    setTimeout(() => {
      updateWhiteboardSize();
    }, 50);
  }

  function toggleExpandWhiteboard() {
    expandWhiteboard.value = !expandWhiteboard.value;

    setTimeout(() => {
      updateWhiteboardSize();
    }, 50);
  }

  function toggleNotes() {
    if (showWhiteboard.value) {
      toggleWhiteboard();
    }
    showNotes.value = !showNotes.value;
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

    &.hide {
      visibility: hidden;
    }
  }
</style>
