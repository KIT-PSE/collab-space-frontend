import { defineStore } from 'pinia';
import { useApi, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { ValidationError } from '@/composables/fetch';
import { computed, ref } from 'vue';

const api = useApi();
const alerts = useAlerts();

export const useAdmin = defineStore('admin', () => {
  const users = ref<User[]>([]);

  const getUsers = computed(async () => {
    if (!users.value.length) {
      await loadUsers();
    }
    return users.value;
  });

  async function loadUsers() {
    try {
      users.value = await api.allUsers();
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Laden der Nutzer fehlgeschlagen', err as Error);
    }
  }

  return {
    getUsers,
  };
});
