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
  useApi,
} from '@/composables/api';

const api = useApi();
const alerts = useAlerts();

/**
 * Represents the application state related to categories and rooms.
 */
export const useStore = defineStore('store', () => {
  const categories: Ref<Category[]> = ref([]);
  const loaded: Ref<boolean> = ref(false);

  /**
   * Loads the categories and their associated rooms from the API.
   * If the data is already loaded, it does nothing.
   */
  async function load(): Promise<void> {
    if (loaded.value) {
      return;
    }

    try {
      categories.value = await api.allCategories();
      loaded.value = true;
    } catch (err) {
      alerts.error('Daten konnten nicht geladen werden.', err as Error);
    }
  }

  /**
   * Unloads the categories and their associated rooms.
   * Resets the categories array and loaded state to their initial values.
   */
  function unload(): void {
    categories.value = [];
    loaded.value = false;
  }

  /**
   * Creates a new category.
   * @param data - The data for creating the category.
   * @returns The created category or `null` if an error occurs.
   * @throws `ValidationError` if the input data is invalid.
   */
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

  /**
   * Finds a category by its ID.
   * @param id - The ID of the category to find.
   * @returns The found category or `null` if not found.
   */
  function findCategory(id: number): Category | null {
    return categories.value.find((c) => c.id === id) ?? null;
  }

  /**
   * Updates a category with the provided data.
   * @param category - The category to update.
   * @param data - The data for updating the category.
   * @returns The updated category or `null` if an error occurs.
   * @throws `ValidationError` if the input data is invalid.
   */
  async function updateCategory(
    category: Category,
    data: UpdateCategory,
  ): Promise<Category | null> {
    try {
      const updatedCategory = await api.updateCategory(category.id, data);

      const index = categories.value.findIndex(
        (c) => c.id === updatedCategory.id,
      );

      if (index === -1) {
        alerts.error('Kategorie konnte nicht gefunden werden.', new Error());
        return null;
      }

      categories.value[index].name = updatedCategory.name;

      return updatedCategory;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Kategorie konnte nicht aktualisiert werden.', err as Error);
    }

    return null;
  }

  /**
   * Deletes a category and removes it from the categories array.
   * @param category - The category to delete.
   */
  async function deleteCategory(category: Category): Promise<void> {
    try {
      await api.deleteCategory(category.id);
      categories.value.splice(categories.value.indexOf(category), 1);
    } catch (err) {
      alerts.error('Kategorie konnte nicht gelöscht werden.', err as Error);
    }
  }

  /**
   * Creates a new room within a category.
   * @param data - The data for creating the room.
   * @returns The created room or `null` if an error occurs.
   * @throws `ValidationError` if the input data is invalid.
   */
  async function createRoom(data: CreateRoom): Promise<Room | null> {
    try {
      const room = await api.createRoom(data);

      findCategory(room.category.id)?.rooms.push({
        ...room,
        category: room.category.id,
      });

      return { ...room, category: room.category.id };
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Raum konnte nicht erstellt werden.', err as Error);
    }

    return null;
  }

  /**
   * Finds a room by its ID.
   * @param id - The ID of the room to find.
   * @returns The found room or `null` if not found.
   */
  function findRoom(id: number): Room | null {
    for (const category of categories.value) {
      const room = category.rooms.find((r) => r.id === id);
      if (room) {
        return room;
      }
    }

    return null;
  }
  /**
   * Updates a room with the provided data.
   * @param room - The room to update.
   * @param data - The data for updating the room.
   * @returns The updated room or `null` if an error occurs.
   * @throws `ValidationError` if the input data is invalid.
   */
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

      updatedRoom.channelId = category.rooms[index].channelId;
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

  /**
   * Deletes a room from its category's rooms array.
   * @param room - The room to delete.
   */
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
    findRoom,
    updateRoom,
    deleteRoom,
  };
});
