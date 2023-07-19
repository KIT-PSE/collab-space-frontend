<template>
  <main class="container-fluid h-100">
    <div class="row h-100">
      <div
        class="col-9 p-2 overflow-hidden position-relative"
        style="max-height: 100%"
      >
        <div class="row">
          <div class="col d-flex justify-content-center mt-3">
            <video
              src="https://placehold.co/1920x1080.mp4?text=eingebettete+Webseite"
              autoplay
              style="max-width: 100%; max-height: 100%; aspect-ratio: 16/9"
            ></video>
          </div>
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
          />
        </div>
        <div id="notes-wrapper" :class="{ hide: !showNotes }">
          <Notes @close="toggleNotes" />
        </div>
      </div>
      <div
        class="col-3 p-2 bg-dark d-flex flex-column justify-content-between"
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
            <div class="card my-1">
              <!--              <img-->
              <!--                src="https://placehold.co/600x400.png?text=Kamera+Bild"-->
              <!--                alt=""-->
              <!--                class="card-img-top"-->
              <!--              />-->
              <Camera :user-id="channel.state.teacher.id" />
              <div class="card-body py-2">
                <div class="card-text text-dark text-decoration-none">
                  {{ channel.state.teacher?.user.name }}
                  <span class="badge text-bg-primary ms-1">Lehrer</span>
                  <span
                    v-if="channel.isSelf(channel.state.teacher)"
                    class="badge text-bg-secondary ms-1"
                  >
                    Du
                  </span>
                  <span
                    v-if="!channel.state.teacher.audio"
                    class="badge text-bg-secondary ms-1"
                  >
                    Muted
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
            <div class="card my-1">
              <!--              <img-->
              <!--                src="https://placehold.co/600x400.png?text=Kamera+Bild"-->
              <!--                alt=""-->
              <!--                class="card-img-top"-->
              <!--              />-->
              <Camera :user-id="student.id" />
              <div class="card-body py-2">
                <div class="card-text text-dark text-decoration-none">
                  {{ student.name }}
                  <span
                    v-if="channel.isSelf(student)"
                    class="badge text-bg-secondary ms-1"
                  >
                    Du
                  </span>
                  <span
                    v-if="!student.audio"
                    class="badge text-bg-secondary ms-1"
                  >
                    Muted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col d-flex justify-content-center">
            <button type="button" class="btn text-primary mx-2">
              <i class="fa fa-hand"></i>
            </button>
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

  <ShareLinkModal :channel="channel.state" />
</template>

<script setup lang="ts">
  import { useChannel } from '@/composables/channel/channel';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useAuth } from '@/composables/auth';
  import Camera from '@/components/Camera.vue';
  import ShareLinkModal from '@/components/ShareLinkModal.vue';
  import Whiteboard from '@/components/Whiteboard.vue';
  import { onMounted, ref } from 'vue';
  import Notes from '@/components/Notes.vue';

  const auth = useAuth();
  const channel = useChannel();

  const showWhiteboard = ref(false);
  const expandWhiteboard = ref(false);

  const showNotes = ref(false);

  const width = ref(0);
  const height = ref(0);

  onMounted(() => {
    window.addEventListener('resize', updateWhiteboardSize);
  });

  onBeforeRouteLeave(() => {
    channel.stopWebcam();
    if (auth.isLoggedIn) {
      channel.leaveAsTeacher();
    } else {
      channel.leave();
    }
  });

  channel.loadWebcams();

  function updateWhiteboardSize() {
    width.value = document.getElementById('whiteboard-wrapper').clientWidth;
    height.value = document.getElementById('whiteboard-wrapper').clientHeight;
  }

  function toggleVideo() {
    channel.toggleVideo();
  }

  function toggleAudio() {
    channel.toggleAudio();
  }

  function toggleWhiteboard() {
    if (showNotes.value) toggleNotes();
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
    if (showWhiteboard.value) toggleWhiteboard();
    showNotes.value = !showNotes.value;
  }
</script>

<style scoped>
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
    max-width: 400px;
    min-width: 300px;

    &.hide {
      visibility: hidden;
    }
  }
</style>
