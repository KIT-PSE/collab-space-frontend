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
  import { useChannel } from '@/composables/channel';

  const channel = useChannel();
  channel.connect();
</script>
