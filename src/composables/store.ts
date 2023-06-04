import { Ref, ref } from 'vue';
import { useAlerts } from '@/composables/alerts';
import { ValidationError } from '@/composables/fetch';
import { defineStore } from 'pinia';
import {
  Category,
  CreateCategory,
  CreateRoom,
  Room,
  UpdateCategory,
  UpdateRoom,
  useApi,
} from '@/composables/api';

const api = useApi();
const alerts = useAlerts();

export const useStore = defineStore('store', () => {
  const categories: Ref<Category[]> = ref([]);
  const loaded: Ref<boolean> = ref(false);

  async function load(): Promise<void> {
    if (loaded.value) {
      return;
    }

    try {
      categories.value = await api.allCategories();
      loaded.value = true;
    } catch (err) {
      alerts.error('Kategorien konnten nicht geladen werden.', err as Error);
    }
  }

  function unload(): void {
    categories.value = [];
    loaded.value = false;
  }

  async function createCategory(
    data: CreateCategory,
  ): Promise<Category | null> {
    try {
      const category = await api.createCategory(data);
      categories.value.push(category);
      return category;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Kategorie konnte nicht erstellt werden.', err as Error);
    }

    return null;
  }

  function findCategory(id: number): Category | null {
    return categories.value.find((c) => c.id === id) ?? null;
  }

  async function updateCategory(
    category: Category,
    data: UpdateCategory,
  ): Promise<Category | null> {
    try {
      const updatedCategory = await api.updateCategory(category.id, data);

      const index = categories.value.findIndex(
        (c) => c.id === updatedCategory.id,
      );

      updatedCategory.rooms = categories.value[index].rooms;

      if (index === -1) {
        alerts.error('Kategorie konnte nicht gefunden werden.', new Error());
        return null;
      }

      categories.value[index] = updatedCategory;

      return updatedCategory;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Kategorie konnte nicht aktualisiert werden.', err as Error);
    }

    return null;
  }

  async function deleteCategory(category: Category): Promise<void> {
    try {
      await api.deleteCategory(category.id);
      // categories.value = categories.value.filter((c) => c.id !== category.id);
      categories.value.splice(categories.value.indexOf(category), 1);
    } catch (err) {
      alerts.error('Kategorie konnte nicht gelöscht werden.', err as Error);
    }
  }

  async function createRoom(data: CreateRoom): Promise<Room | null> {
    try {
      const room = await api.createRoom(data);

      findCategory(room.category.id)?.rooms.push({
        ...room,
        category: room.category.id,
      });

      return room;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Raum konnte nicht erstellt werden.', err as Error);
    }

    return null;
  }

  async function updateRoom(
    room: Room,
    data: { name: string },
  ): Promise<Room | null> {
    try {
      const updatedRoom = await api.updateRoom(room.id, room.category, data);

      const category = findCategory(room.category);
      const index = category?.rooms.findIndex((r) => r.id === updatedRoom.id);

      if (!category || index === undefined || index === -1) {
        alerts.error('Raum konnte nicht gefunden werden.', new Error());
        return null;
      }

      category.rooms[index] = updatedRoom;

      return updatedRoom;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Raum konnte nicht aktualisiert werden.', err as Error);
    }

    return null;
  }

  async function deleteRoom(room: Room): Promise<void> {
    try {
      await api.deleteRoom(room.id, room.category);
      const category = findCategory(room.category);
      category?.rooms.splice(category.rooms.indexOf(room), 1);
    } catch (err) {
      alerts.error('Raum konnte nicht gelöscht werden.', err as Error);
    }
  }

  return {
    categories,
    loaded,
    load,
    unload,
    createCategory,
    updateCategory,
    deleteCategory,
    createRoom,
    updateRoom,
    deleteRoom,
  };
});
