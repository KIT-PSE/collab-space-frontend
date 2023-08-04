<template>
  <div class="row">
    <div
      v-for="category in store.categories"
      :key="category.id"
      class="col-lg-9"
    >
      <div class="d-flex justify-content-between">
        <h3>{{ category.name }}</h3>
        <div>
          <button class="btn text-secondary" @click="editCategory(category)">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn text-secondary" @click="deleteCategory(category)">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="row py-4">
        <div v-for="room in category.rooms" :key="room.id" class="col-4">
          <div
            class="card my-1"
            style="cursor: pointer"
            @click="openRoom(room)"
          >
            <img
              src="https://placehold.co/600x400.png?text=Raum+Vorschau"
              alt=""
              class="card-img-top"
            />
            <div class="card-body py-2">
              <div class="card-text text-dark text-decoration-none">
                <div class="d-flex justify-content-between align-items-center">
                  <p>
                    {{ room.name }}
                    <span v-if="room.channelId" class="badge text-bg-primary">
                      Live
                    </span>
                  </p>
                  <div>
                    <button
                      class="btn btn-sm text-secondary"
                      @click.stop="editRoom(room)"
                    >
                      <i class="fa fa-pen"></i>
                    </button>
                    <button
                      class="btn btn-sm text-secondary"
                      @click.stop="deleteRoom(room)"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <EditCategoryModal :category="categoryToEdit" />
  <EditRoomModal :room="roomToEdit" />
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
      `Soll die Kategorie <b>${category.name}</b> wirklich gelöscht werden?`,
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
</script>
