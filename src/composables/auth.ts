import { defineStore } from 'pinia';
import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, reactive, watch } from 'vue';
import router from '@/router';
import { Timer, useTimer } from '@/composables/timer';
import { HttpError, ValidationError } from '@/composables/fetch';
import { LoginData, RegisterData, useApi, User } from '@/composables/api';

const alerts = useAlerts();
const api = useApi();

export const useAuth = defineStore('auth', () => {
  const state = reactive({
    user: null as User | null,
    loggedIn: false,
    loaded: false,
    loginTimer: null as Timer | null,
  });

  const isLoggedIn = computed(() => state.loggedIn);
  const isAdmin = computed(() => state.user?.role === 'admin');

  async function login(credentials: LoginData) {
    try {
      const { user } = await api.login(credentials);
      loginUser(user);

      await router.push({ name: 'dashboard' });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      if (err instanceof HttpError && err.response.status === 401) {
        alerts.danger(
          'Einloggen fehlgeschlagen',
          'Bitte überprüfe deine E-Mail Adresse und dein Passwort.',
        );
        return;
      }

      alerts.error('Einloggen fehlgeschlagen', err as Error);
    }
  }

  async function register(data: RegisterData) {
    try {
      const { user } = await api.register(data);
      loginUser(user);

      await router.push({ name: 'dashboard' });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Registrieren fehlgeschlagen', err as Error);
    }
  }

  async function logout() {
    try {
      if (!isLoggedIn.value) {
        alerts.danger('Ausloggen fehlgeschlagen', 'Du bist nicht eingeloggt.');
        return;
      }

      await api.logout();
      await logoutUser();

      alerts.success('Erfolgreich ausgeloggt');
    } catch (error) {
      alerts.error('Ausloggen fehlgeschlagen', error as Error);
    }
  }

  async function deleteFunction(): Promise<void> {
    try {
      if (!isLoggedIn.value) {
        alerts.danger(
          'Löschen des Accounts fehlgeschlagen',
          'Du bist nicht eingeloggt.',
        );
        return;
      }

      await api.deleteAccount();
      await logoutUser();

      alerts.success('Account erfolgreich gelöscht');
    } catch (error) {
      alerts.error('Löschen des Accounts fehlgeschlagen', error as Error);
    }
  }

  async function loadUser(): Promise<void> {
    if (state.loaded) {
      return;
    }

    try {
      const { user } = await api.profile();
      loginUser(user);
    } catch (err) {
      if (!(err instanceof HttpError && err.response.status === 401)) {
        alerts.error('Benutzer konnte nicht geladen werden.', err as Error);
      }
    } finally {
      state.loaded = true;
    }
  }

  async function logoutUser() {
    state.loggedIn = false;
    await router.push({ name: 'login' });

    state.user = null;
    state.loginTimer?.stop();
    state.loginTimer = null;
  }

  function loginUser(user: User) {
    state.user = user;
    state.loggedIn = true;

    /*const startDate = new Date();
    const endDate = new Date(exp * 1000);
    const amount = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    state.loginTimer?.stop();
    state.loginTimer = useTimer(amount);
    state.loginTimer.start();
    state.loginTimer.onFinished(async () => {
      await logoutUser();
      alerts.warning(
        'Du wurdest automatisch ausgeloggt.',
        'Bitte logge dich erneut ein.',
      );
    });*/
  }

  function onLogout(callback: () => void): void {
    watch(
      () => state.loggedIn,
      (loggedIn) => {
        if (!loggedIn) {
          callback();
        }
      },
    );
  }

  return {
    state,
    isLoggedIn,
    isAdmin,
    login,
    register,
    delete: deleteFunction,
    logout,
    loadUser,
    onLogout,
  };
});

export function useUser(): ComputedRef<User> {
  const store = useAuth();
  return computed(() => {
    if (store.state.user === null) {
      throw new Error('User not loaded');
    }

    return store.state.user;
  });
}
