import { Ref, ref } from 'vue';
import { Category, CreateCategory, UpdateCategory } from '@/api/category.api';
import { useAlerts } from '@/composables/alerts';
import { useApi } from '@/api';
import { ValidationError } from '@/composables/fetch';
import { defineStore } from 'pinia';

const api = useApi();
const alerts = useAlerts();

export const useCategories = defineStore('categories', () => {
  const categories: Ref<Category[]> = ref([]);
  const loaded: Ref<boolean> = ref(false);

  async function load(): Promise<void> {
    if (loaded.value) {
      return;
    }

    try {
      categories.value = await api.category.all();
      loaded.value = true;
    } catch (err) {
      alerts.error('Kategorien konnten nicht geladen werden.', err as Error);
    }
  }

  function unload(): void {
    categories.value = [];
    loaded.value = false;
  }

  async function create(data: CreateCategory): Promise<Category | null> {
    try {
      const category = await api.category.create(data);
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

  async function update(
    category: Category,
    data: UpdateCategory,
  ): Promise<Category | null> {
    try {
      const updatedCategory = await api.category.update(category.id, data);

      const index = categories.value.findIndex(
        (c) => c.id === updatedCategory.id,
      );
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

  async function deleteFunction(category: Category): Promise<void> {
    try {
      await api.category.delete(category.id);
      categories.value = categories.value.filter((c) => c.id !== category.id);
    } catch (err) {
      alerts.error('Kategorie konnte nicht gelöscht werden.', err as Error);
    }
  }

  return {
    categories,
    loaded,
    load,
    unload,
    create,
    update,
    delete: deleteFunction,
  };
});
