import { useAlerts } from '@/composables/alerts';
import { computed, ComputedRef, type Ref, ref } from 'vue';
import router from '@/router';
import type { Timer } from '@/composables/timer';
import { useTimer } from '@/composables/timer';
import { useApi } from '@/composables/api';
import { useSingleton } from '@/composables/utils';

const alert = useAlerts();
const api = useApi();

class Auth {
  public user: Ref<User | null> = ref(null);
  private loggedIn = false;
  public loginTimer: Timer | null = null;
  private loaded = false;

  public async login(email: string, password: string): Promise<void> {
    try {
      const { user } = await api.login({ email, password });
      this.loginUser(user);

      await router.push({ name: 'dashboard' });
    } catch (error) {
      console.error(error);
      alert.danger(
        'Einloggen fehlgeschlagen',
        'Bitte überprüfe deine E-Mail-Adresse und dein Passwort.',
      );
    }
  }

  public async logout(): Promise<void> {
    try {
      if (!this.isLoggedIn()) {
        alert.danger('Ausloggen fehlgeschlagen', 'Du bist nicht eingeloggt.');
        return;
      }

      await api.logout();
      await this.logoutUser();

      alert.success('Erfolgreich ausgeloggt');
    } catch (error) {
      alert.error('Ausloggen fehlgeschlagen', error as Error);
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
      alert.warning(
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
