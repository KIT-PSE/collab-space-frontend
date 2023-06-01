<template>
  <main class="container-fluid vh-100">
    <div class="row h-100">
      <div class="col-9 p-2 overflow-hidden" style="max-height: 100%">
        <div class="row">
          <div class="col">
            <router-link to="/dashboard">
              <img
                src="@/assets/textless-logo.png"
                alt="CollabSpace"
                width="100"
              />
            </router-link>
          </div>
        </div>

        <!--        <img-->
        <!--          src="https://placehold.co/1000x800.mp4?text=eingebettete+Webseite"-->
        <!--          alt=""-->
        <!--          class="w-100 h-100"-->
        <!--        />-->

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
          <h3 class="text-center text-primary mt-2">Raum 101</h3>
          <div v-for="camera in cameras" class="col-6">
            <div class="card my-1">
              <img
                src="https://placehold.co/600x400.png?text=Kamera+Bild"
                alt=""
                class="card-img-top"
              />
              <div class="card-body py-2">
                <router-link
                  to="/room"
                  class="card-text text-dark text-decoration-none"
                >
                  Kamera {{ camera + 1 }}
                </router-link>
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
              @click="audio = !audio"
            >
              <i v-if="audio" class="fa fa-microphone"></i>
              <i v-else class="fa fa-microphone-slash"></i>
            </button>
            <button
              type="button"
              class="btn text-primary mx-2"
              @click="video = !video"
            >
              <i v-if="video" class="fa fa-video"></i>
              <i v-else class="fa fa-video-slash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const video = ref(true);
  const audio = ref(true);

  const cameras = ref(randomRange(20));

  function randomRange(max: number) {
    return [...Array(Math.floor(Math.random() * (max - 1)) + 1).keys()];
  }
</script>
