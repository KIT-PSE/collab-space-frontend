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

  async function makeAdmin(id: number) {
    try {
      const user = await api.makeAdmin({ id });
      const index = users.value.findIndex((u) => u.id === user.id);
      users.value[index] = user;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Adminrechte vergeben fehlgeschlagen', err as Error);
    }
  }

  return {
    users,
    load,
    makeAdmin,
    loaded,
  };
});
