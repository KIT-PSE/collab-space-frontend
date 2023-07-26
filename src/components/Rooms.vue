<template>
  <div class="row">
    <transition-group name="bounce">
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
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <p>
                        {{ room.name }}
                        <span
                          v-if="room.channelId"
                          class="badge text-bg-primary"
                        >
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
          </transition-group>
        </div>
      </div>
    </transition-group>
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

  function editCategory(category: Category) {
    categoryToEdit.value = category;
    openModal('edit-category-modal');
  }

  function editRoom(room: Room) {
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
