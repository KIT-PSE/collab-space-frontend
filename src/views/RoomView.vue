<template>
  <main class="container-fluid vh-100">
    <div class="row h-100">
      <div class="col-9 p-2 overflow-hidden" style="max-height: 100%">
        <div class="row">
          <div class="col d-flex align-items-center">
            <router-link to="/dashboard">
              <img
                src="@/assets/textless-logo.png"
                alt="CollabSpace"
                width="100"
              />
            </router-link>
          </div>
        </div>

        <div class="row">
          <div class="col d-flex justify-content-center mt-3">
            <video
              src="https://placehold.co/1000x800.mp4?text=eingebettete+Webseite"
              autoplay
              style="max-width: 100%; max-height: 100%"
            ></video>
          </div>
        </div>
      </div>
      <div
        class="col-3 p-2 bg-dark d-flex flex-column justify-content-between"
        style="max-height: 100%"
      >
        <div class="row overflow-y-auto mb-2">
          <h3 class="text-center text-primary mt-2">
            {{ channel.state.room?.name }}
          </h3>

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
                  <span
                      v-if="channel.state.teacher.handSignal"
                      class="badge text-bg-secondary ms-1"
                  >
                    <i class="fas fa-hand-paper"></i>
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
        <div class="row">
          <div class="col d-flex justify-content-center">
            <button
                type="button"
                class="btn text-primary mx-2"
                @click="toggleHandSignal()"
            >
              <i v-if="channel.currentUser().handSignal" class="fa fa-hand-paper"></i>
              <i v-else class="fa fa-hand-rock"></i>
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
</template>

<script setup lang="ts">
  import { useChannel } from '@/composables/channel';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useAuth } from '@/composables/auth';
  import Camera from '@/components/Camera.vue';

  const auth = useAuth();
  const channel = useChannel();

  onBeforeRouteLeave(() => {
    channel.stopWebcam();
    if (auth.isLoggedIn) {
      channel.leaveAsTeacher();
    } else {
      channel.leave();
    }
  });

  channel.loadWebcams();

  function toggleVideo() {
    channel.toggleVideo();
  }

  function toggleAudio() {
    channel.toggleAudio();
  }

  function toggleHandSignal() {
    channel.toggleHandSignal();
  }

</script>