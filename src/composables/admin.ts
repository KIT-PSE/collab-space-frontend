import { defineStore } from 'pinia';
import { useApi, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { ValidationError } from '@/composables/fetch';
import { ref } from 'vue';

const api = useApi();
const alerts = useAlerts();

export const useAdmin = defineStore('admin', () => {
  const users = ref<User[]>([]);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) {
      return;
    }

    try {
      users.value = await api.allUsers();
    } catch (err) {
      alerts.error('Laden der Nutzer fehlgeschlagen', err as Error);
    }
  }

  return {
    users,
    load,
    loaded,
  };
});
