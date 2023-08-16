<template>
  <div class="row mb-5">
    <div
      class="card d-flex align-items-center justify-content-center py-5"
      v-if="store.categories.length === 0"
    >
      <i class="fa-regular fa-xl fa-folder-open"></i>
      <h4 class="mt-3">Keine Kategorien vorhanden</h4>
      <p class="m-0">
        Hier ist noch nichts zu sehen. Erstelle deine erste Kategorie, um zu
        starten!
      </p>
      <button
        class="btn btn-primary mt-3"
        data-bs-toggle="modal"
        data-bs-target="#create-category-modal"
      >
        <i class="fa fa-plus"></i>
        Neue Kategorie anlegen
      </button>
    </div>

    <div
      v-for="category in store.categories"
      :key="category.id"
      class="col-lg-9 mb-4"
    >
      <div
        class="d-flex justify-content-between align-items-center rounded ps-3 pe-1 py-2"
        style="background: rgba(0, 0, 0, 0.09)"
      >
        <h4 class="m-0 text-truncate" :title="category.name">
          {{ category.name }}
        </h4>
        <div class="d-flex">
          <button class="btn text-secondary" @click="editCategory(category)">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn text-secondary" @click="deleteCategory(category)">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="row py-4">
        <div v-if="category.rooms.length === 0">
          <div class="card my-1 col-4">
            <p class="py-4 px-3 text-center m-0">
              Hier ist noch nichts zu sehen. Füge dieser Kategorie den ersten
              Raum hinzu!
            </p>
          </div>
        </div>
        <div v-for="room in category.rooms" :key="room.id" class="col-4">
          <div
            class="card my-1 position-relative"
            style="cursor: pointer"
            :class="room.channelId ? 'border-primary' : ''"
            @click="openRoom(room)"
          >
            <span
              v-if="room.channelId"
              class="position-absolute badge text-bg-primary top-0 start-0 m-2"
            >
              Live
            </span>
            <div
              class="card-body d-flex flex-column justify-content-end py-2 pt-5"
            >
              <div class="card-text text-dark text-decoration-none">
                <div>
                  <p class="m-0 fw-semibold text-truncate" :title="room.name">
                    {{ room.name }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="card-footer d-flex justify-content-between align-items-center"
            >
              <span style="font-size: 0.86rem">
                {{ room.channelId ? 'Beitreten' : 'Öffnen' }}
              </span>

              <div>
                <button
                  class="btn btn-sm text-secondary"
                  @click.stop="editRoom(room)"
                >
                  <i class="fa fa-pen"></i>
                </button>
                <button
                  v-if="!room.channelId"
                  class="btn btn-sm text-secondary"
                  @click.stop="deleteRoom(room)"
                >
                  <i class="fa fa-trash"></i>
                </button>
                <button
                  v-if="room.channelId"
                  class="btn btn-sm text-secondary"
                  @click.stop="closeRoom(room)"
                >
                  <i class="fa fa-ban"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <EditCategoryModal :category="categoryToEdit" />
  <EditRoomModal :room="roomToEdit" />
  <CreateCategoryModal />
</template>

<script setup lang="ts">
  import { useAuth, useUser } from '@/composables/auth';
  import { openModal } from '@/utils';
  import { ask } from '@/composables/prompt';
  import { Category, Room } from '@/composables/api';
  import { useStore } from '@/composables/store';
  import EditCategoryModal from '@/components/EditCategoryModal.vue';
  import { ref } from 'vue';
  import EditRoomModal from '@/components/EditRoomModal.vue';
  import { useChannel } from '@/composables/channel/channel';
  import { useRouter } from 'vue-router';
  import CreateCategoryModal from '@/components/CreateCategoryModal.vue';

  const user = useUser();
  const auth = useAuth();
  const store = useStore();
  const router = useRouter();
  const channel = useChannel();

  store.load();
  auth.onLogout(() => store.unload());

  /**
   * Asynchronous function that opens a room.
   * If the room has a 'channelId', it joins the channel as a teacher and navigates to the room's URL.
   * If there is no 'channelId', it opens a new channel for the user.
   * @param room - The room to be opened.
   */
  async function openRoom(room: Room) {
    if (room.channelId) {
      await channel.joinAsTeacher(room.channelId, user.value);
      await router.push(`/room/${room.channelId}`);
      return;
    }

    await channel.open(user.value, room);
  }

  let categoryToEdit = ref<Category | null>(null);
  let roomToEdit = ref<Room | null>(null);

  /**
   * Function that sets the 'categoryToEdit' variable to the provided 'category'
   * and opens the 'edit-category-modal'.
   * @param category - The category to be edited.
   */
  function editCategory(category: Category) {
    categoryToEdit.value = category;
    openModal('edit-category-modal');
  }

  /**
   * Function that sets the 'roomToEdit' variable to the provided 'room'
   * and opens the 'edit-room-modal'.
   * @param room - The room to be edited.
   */
  function editRoom(room: Room) {
    roomToEdit.value = room;
    openModal('edit-room-modal');
  }

  /**
   * Asynchronous function that prompts the user to confirm category deletion.
   * If confirmed, it deletes the provided 'category' using the 'store.deleteCategory()' function.
   * @param category - The category to be deleted.
   */
  async function deleteCategory(category: Category) {
    const shouldDestroy = await ask(
      'Kategorie löschen',
      `Soll die Kategorie <b>${category.name}</b> wirklich gelöscht werden? <b>Achtung:</b> Alle Räume in dieser Kategorie werden ebenfalls gelöscht.`,
      'Löschen',
    );

    if (!shouldDestroy) {
      return;
    }

    await store.deleteCategory(category);
  }

  /**
   * Asynchronous function that prompts the user to confirm room deletion.
   * If confirmed, it deletes the provided 'room' using the 'store.deleteRoom()' function.
   * @param room - The room to be deleted.
   */
  async function deleteRoom(room: Room) {
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

  /**
   * Asynchronous function that prompts the user to confirm room closure.
   * If confirmed, it closes the provided 'room' using the 'channel.close()' function.
   * @param room - The room to be closed.
   */
  async function closeRoom(room: Room) {
    const shouldClose = await ask(
      'Raum schließen',
      `Soll der Raum <b>${room.name}</b> wirklich geschlossen werden? Alle Schüler werden aus dem Raum entfernt.`,
      'Schließen',
    );

    if (!shouldClose || !room.channelId) {
      return;
    }

    channel.close(room.channelId);
  }
</script>
