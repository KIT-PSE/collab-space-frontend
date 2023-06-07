<template>
  <div class="row">
    <transition-group name="bounce">
      <div
        v-for="category in store.categories"
        :key="category"
        class="col-lg-9"
      >
        <div class="d-flex justify-content-between">
          <h3>{{ category.name }}</h3>
          <div>
            <button class="btn text-secondary" @click="editCategory(category)">
              <i class="fa fa-pen"></i>
            </button>
            <button
              class="btn text-secondary"
              @click="deleteCategory(category)"
            >
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="row py-4">
          <transition-group name="bounce">
            <div v-for="room in category.rooms" :key="room.id" class="col-4">
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
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      {{ room.name }}
                      <div>
                        <button
                          class="btn btn-sm text-secondary"
                          @click.prevent="editRoom(room)"
                        >
                          <i class="fa fa-pen"></i>
                        </button>
                        <button
                          class="btn btn-sm text-secondary"
                          @click.prevent="deleteRoom(room)"
                        >
                          <i class="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition-group>
  </div>

  <EditCategoryModal :category="categoryToEdit" />
  <EditRoomModal :room="roomToEdit" />
</template>

<script setup lang="ts">
  import { useAuth } from '@/composables/auth';
  import { openModal } from '@/utils';
  import { ask } from '@/composables/prompt';
  import { Category } from '@/composables/api';
  import { useStore } from '@/composables/store';
  import EditCategoryModal from '@/components/EditCategoryModal.vue';
  import {ref, watch} from 'vue';
  import EditRoomModal from '@/components/EditRoomModal.vue';

  const auth = useAuth();
  const store = useStore();

  store.load();
  // Konnte nicht testen, ob die neue Lösung korrekt ist
  // zuvor: auth.onLogout(() => store.unload());
  auth.$subscribe(loggedIn => {
    if (!loggedIn) {
      store.unload();
    }
  });

  let categoryToEdit = ref(null);
  let roomToEdit = ref(null);

  function editCategory(category) {
    categoryToEdit.value = category;
    openModal('edit-category-modal');
  }

  function editRoom(room) {
    roomToEdit.value = room;
    openModal('edit-room-modal');
  }

  async function deleteCategory(category: Category) {
    const shouldDestroy = await ask(
      'Kategorie löschen',
      `Soll die Kategorie <b>${category.name}</b> wirklich gelöscht werden?`,
      'Löschen',
    );

    if (!shouldDestroy) {
      return;
    }

    await store.deleteCategory(category);
  }

  async function deleteRoom(room) {
    const shouldDestroy = await ask(
      'Raum löschen',
      `Soll der Raum <b>${room.name}</b> wirklich gelöscht werden?`,
      'Löschen',
    );

    if (!shouldDestroy) {
      return;
    }

    await store.deleteRoom(room);
  }
</script>
