<template>
  <Layout title="Dashboard" :buttons="['account', 'admin']">
    <h3>Herzlich Willkommen {{ auth.state.user?.name }}!</h3>
    <hr />

    <div class="row my-5">
      <div v-if="store.categories && store.categories.length !== 0" class="col">
        <button
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#create-room-modal"
        >
          <i class="fa fa-plus"></i>
          Neuen Raum erstellen
        </button>
        <button
          class="btn btn-primary ms-3"
          data-bs-toggle="modal"
          data-bs-target="#create-category-modal"
        >
          <i class="fa fa-plus"></i>
          Neue Kategorie anlegen
        </button>
      </div>
    </div>

    <Rooms />

    <CreateRoomModal />
    <CreateCategoryModal />
  </Layout>
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import CreateCategoryModal from '@/components/CreateCategoryModal.vue';
  import CreateRoomModal from '@/components/CreateRoomModal.vue';
  import Rooms from '@/components/Rooms.vue';
  import { useChannel } from '@/composables/channel/channel';
  import { useAuth } from '@/composables/auth';
  import { useStore } from '@/composables/store';

  const channel = useChannel();
  const auth = useAuth();
  const store = useStore();
  channel.connect();
</script>
