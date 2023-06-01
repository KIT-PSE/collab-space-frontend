<template>
  <Layout title="Dashboard" :buttons="['account']">
    <div class="row my-5">
      <div class="col">
        <button
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#create-room-modal"
        >
          <i class="fa fa-plus"></i>
          Raum Erstellen
        </button>
        <button
          class="btn btn-primary ms-2"
          data-bs-toggle="modal"
          data-bs-target="#create-category-modal"
        >
          <i class="fa fa-plus"></i>
          Neue Kategorie anlegen
        </button>
      </div>
    </div>

    <div class="row">
      <div
        v-for="(rooms, category) in categories"
        :key="category"
        class="col-lg-9"
      >
        <h3>Kategorie {{ category + 1 }}</h3>
        <div class="row py-4">
          <div v-for="room in rooms" :key="room" class="col-4">
            <div class="card my-1">
              <img
                src="https://placehold.co/600x400.png?text=Raum+Vorschau"
                alt=""
                class="card-img-top"
              />
              <div class="card-body py-2">
                <router-link
                  to="/room"
                  class="card-text text-dark text-decoration-none"
                >
                  Raum {{ category + 1 }}0{{ room + 1 }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal
      id="create-room-modal"
      title="Neuen Raum erstellen"
      submit-text="Erstellen"
    >
      <Input label="Name des Raums" />
      <PasswordInput label="Den Raum mit einem Passwort schützen?" />
    </Modal>

    <Modal
      id="create-category-modal"
      title="Neue Kategorie anlegen"
      submit-text="Hinzufügen"
    >
      <Input label="Name der Kategorie" />
    </Modal>
  </Layout>
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import Modal from '@/components/Modal.vue';
  import Input from '@/components/inputs/Input.vue';
  import PasswordInput from '@/components/inputs/PasswordInput.vue';
  import { ref } from 'vue';

  function randomRange(max: number) {
    return [...Array(Math.floor(Math.random() * (max - 1)) + 1).keys()];
  }

  const categories = ref(randomRange(4).map(() => randomRange(6)));
</script>
