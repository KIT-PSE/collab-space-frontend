import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, type Ref, ref, watch } from 'vue';
import router from '@/router';
import type { Timer } from '@/composables/timer';
import { useTimer } from '@/composables/timer';
import { useSingleton } from '@/composables/utils';
import { HttpError, ValidationError } from '@/composables/fetch';
import { LoginData, RegisterData, useApi, User } from '@/composables/api';

const alerts = useAlerts();
const api = useApi();

class Auth {
  public user: Ref<User | null> = ref(null);
  public loggedIn = ref(false);
  public loginTimer: Timer | null = null;
  private loaded = false;

  /** @throws ValidationError */
  public async login(credentials: LoginData): Promise<void> {
    try {
      const { user, exp } = await api.login(credentials);
      this.loginUser(user, exp);

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

  /** @throws ValidationError */
  public async register(data: RegisterData): Promise<void> {
    try {
      const { user, exp } = await api.register(data);
      this.loginUser(user, exp);

      await router.push({ name: 'dashboard' });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      alerts.error('Registrieren fehlgeschlagen', err as Error);
    }
  }

  public async logout(): Promise<void> {
    try {
      if (!this.isLoggedIn()) {
        alerts.danger('Ausloggen fehlgeschlagen', 'Du bist nicht eingeloggt.');
        return;
      }

      await api.logout();
      await this.logoutUser();

      alerts.success('Erfolgreich ausgeloggt');
    } catch (error) {
      alerts.error('Ausloggen fehlgeschlagen', error as Error);
    }
  }

  public async loadUser(): Promise<void> {
    if (this.loaded) {
      return;
    }

    try {
      const { user, exp } = await api.profile();
      this.loginUser(user, exp);
    } catch (err) {
      if (!(err instanceof HttpError && err.response.status === 401)) {
        alerts.error('Benutzer konnte nicht geladen werden.', err as Error);
      }
    } finally {
      this.loaded = true;
    }
  }

  public isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  public isAdmin(): boolean {
    return this.user.value?.role === 'admin';
  }

  public onLogout(callback: () => void): void {
    watch(this.loggedIn, (loggedIn) => {
      if (!loggedIn) {
        callback();
      }
    });
  }

  private async logoutUser(): Promise<void> {
    this.loggedIn.value = false;
    await router.push({ name: 'login' });

    this.user.value = null;
    this.loginTimer?.stop();
    this.loginTimer = null;
  }

  private loginUser(user: User, exp: number): void {
    this.user.value = user;
    this.loggedIn.value = true;

    const startDate = new Date();
    const endDate = new Date(exp * 1000);
    const amount = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    this.loginTimer?.stop();
    this.loginTimer = useTimer(amount);
    this.loginTimer.start();
    this.loginTimer.onFinished(async () => {
      await this.logoutUser();
      alerts.warning(
        'Du wurdest automatisch ausgeloggt.',
        'Bitte logge dich erneut ein.',
      );
    });
  }
}

export const useAuth = useSingleton(new Auth());

export function useUser(): ComputedRef<User> {
  return computed(() => {
    const { user } = useAuth();

    if (user.value === null) {
      throw new Error('User not loaded');
    }

    return user.value;
  });
}
