import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, type Ref, ref } from 'vue';
import router from '@/router';
import type { Timer } from '@/composables/timer';
import { useTimer } from '@/composables/timer';
import { useApi } from '@/composables/api';
import { useSingleton } from '@/composables/utils';
import { Form, ValidationError } from '@/composables/form';
import { HttpError } from '@/composables/fetch';

const alerts = useAlerts();
const api = useApi();

class Auth {
  public user: Ref<User | null> = ref(null);
  private loggedIn = false;
  public loginTimer: Timer | null = null;
  private loaded = false;

  public async login(form: Form<any>): Promise<void> {
    try {
      const { user } = await form.post('/auth/login');
      this.loginUser(user);

      await router.push({ name: 'dashboard' });
    } catch (err) {
      if (err instanceof ValidationError) {
        return;
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
      const { user } = await api.profile();
      this.loginUser(user);
    } catch (e) {
    } finally {
      this.loaded = true;
    }
  }

  private async logoutUser(): Promise<void> {
    this.loggedIn = false;
    await router.push({ name: 'login' });

    this.user.value = null;
    this.loginTimer?.stop();
    this.loginTimer = null;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  private loginUser(user: User): void {
    this.user.value = user;
    this.loggedIn = true;

    const startDate = new Date();
    const endDate = new Date(user.exp * 1000);
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
