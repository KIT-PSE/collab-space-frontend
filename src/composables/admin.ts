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

  /**
   * Load user data from the server if it is not already loaded.
   * This is an asynchronous function.
   *
   * @returns A Promise that resolves when the user data is loaded.
   */
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

  /**
   * Change the role of a user with the specified ID.
   * This is an asynchronous function.
   *
   * @param id - The ID of the user whose role needs to be changed.
   * @returns A Promise that resolves when the user role is changed successfully.
   * @throws  If there is a validation error during the role change.
   */
  async function changeUserRole(id: number) {
    try {
      const user = await api.changeUserRole({ id });
      const index = users.value.findIndex((u) => u.id === user.id);
      users.value[index] = user;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Ändern der Nutzerrechte fehlgeschlagen', err as Error);
    }
  }

  /**
   * Delete a user account with the specified ID.
   * This is an asynchronous function.
   *
   * @param id - The ID of the user account to be deleted.
   * @returns A Promise that resolves when the user account is deleted successfully.
   */
  async function deleteAccount(id: number) {
    try {
      await api.deleteUserAccount(id);

      const index = users.value.findIndex((u) => u.id === id);
      users.value.splice(index, 1);

      alerts.success('Account erfolgreich gelöscht');
    } catch (error) {
      alerts.error('Löschen des Accounts fehlgeschlagen', error as Error);
    }
  }

  return {
    users,
    load,
    changeUserRole,
    deleteAccount,
    loaded,
  };
});
