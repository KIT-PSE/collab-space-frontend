import { defineStore } from 'pinia';
import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, ref } from 'vue';
import router from '@/router';
import { useTimer } from '@/composables/timer';
import { HttpError, ValidationError } from '@/composables/fetch';
import { LoginData, RegisterData, useApi, User } from '@/composables/api';

const alerts = useAlerts();
const api = useApi();

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loggedIn = ref(false);
  const loaded = ref(false);

  const loginTimer = ref<ReturnType<typeof useTimer>>(useTimer());
  loginTimer.value.initialise(60 * 60);

  const isLoggedIn = computed(() => loggedIn.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(credentials: LoginData) {
    try {
      const { user, exp } = await api.login(credentials);
      loginUser(user, exp);

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
      const { user, exp } = await api.register(data);
      loginUser(user, exp);

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

  async function loadUser() {
    if (loaded.value) {
      return;
    }

    try {
      const { user, exp } = await api.profile();
      loginUser(user, exp);
    } catch (err) {
      if (!(err instanceof HttpError && err.response.status === 401)) {
        alerts.error('Benutzer konnte nicht geladen werden.', err as Error);
      }
    } finally {
      loaded.value = true;
    }
  }

  async function logoutUser() {
    loggedIn.value = false;
    await router.push({ name: 'login' });

    user.value = null;
    loginTimer.value.stop();
  }

  function loginUser(_user: User, exp: number) {
    user.value = _user;
    loggedIn.value = true;

    const startDate = new Date();
    const endDate = new Date(exp * 1000);
    const amount = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    loginTimer.value.stop();
    loginTimer.value.reset();
    loginTimer.value.start();
    loginTimer.value.onFinished(async () => {
      await logoutUser();
      alerts.warning(
        'Du wurdest automatisch ausgeloggt.',
        'Bitte logge dich erneut ein.',
      );
    });
  }

  return {
    user,
    loggedIn,
    loginTimer,
    loaded,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    loadUser,
  };
});

export function useUser(): ComputedRef<User> {
  const store = useAuth();
  return computed(() => {
    if (store.user === null) {
      throw new Error('User not loaded');
    }

    return store.user;
  });
}
