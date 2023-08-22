import { defineStore } from 'pinia';
import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, reactive, watch } from 'vue';
import router from '@/router';
import { Timer, useTimer } from '@/composables/timer';
import { HttpError, ValidationError } from '@/composables/fetch';
import {
  LoginData,
  RegisterData,
  UpdateUser,
  useApi,
  User,
} from '@/composables/api';

const alerts = useAlerts();
const api = useApi();

/**
 * useAuth store manages authentication-related state and actions.
 */
export const useAuth = defineStore('auth', () => {
  const state = reactive({
    user: null as User | null,
    loggedIn: false,
    loaded: false,
    loginTimer: null as Timer | null,
  });

  const isLoggedIn = computed(() => state.loggedIn);
  const isAdmin = computed(() => state.user?.role === 'admin');

  /**
   * Log in a user with the provided credentials.
   *
   * @param credentials - The login data containing email and password.
   */
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

  /**
   * Register a new user with the provided registration data.
   *
   * @param data - The registration data containing organization, name, email, password, and confirmPassword.
   */
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

  /**
   * Log out the currently logged-in user.
   */
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

  /**
   * Delete the account of the currently logged-in user.
   */
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

  /**
   * Load the user data if not already loaded.
   */
  async function loadUser(): Promise<void> {
    if (state.loaded) {
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
      state.loaded = true;
    }
  }

  /**
   * Log out the user and reset state to initial values.
   */
  async function logoutUser() {
    state.loggedIn = false;
    await router.push({ name: 'login' });

    state.user = null;
    state.loginTimer?.stop();
    state.loginTimer = null;
  }

  /**
   * Log in the user, set the login timer, and handle auto-logout.
   *
   * @param user - The user object returned from the login response.
   * @param exp - The expiration timestamp of the login session.
   */
  function loginUser(user: User, exp: number) {
    state.user = user;
    state.loggedIn = true;

    const startDate = new Date();
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
    });
  }

  /**
   * Register a callback function to be called on user logout.
   *
   * @param callback - The callback function to be executed on user logout.
   */
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

  /**
   * Change the account data of the currently logged-in user.
   *
   * @returns A Promise that resolves to a boolean indicating the success of the account data change.
   */
  async function updateUser(data: UpdateUser): Promise<boolean> {
    if (state.user === null) {
      return false;
    }

    try {
      state.user = await api.updateUser(state.user.id, data);
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Update fehlgeschlagen', err as Error);
    }

    return false;
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
    updateUser,
  };
});

/**
 * Provides a computed property to access the currently logged-in user from the useAuth store.
 *
 * @returns A ComputedRef<User> representing the currently logged-in user.
 */
export function useUser(): ComputedRef<User> {
  const store = useAuth();
  return computed(() => {
    if (store.state.user === null) {
      throw new Error('User not loaded');
    }

    return store.state.user;
  });
}
