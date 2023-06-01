import type { RouteLocationNormalized } from 'vue-router';
import { useAlerts } from '@/composables/alerts';
import { useAuth } from '@/composables/auth';

const auth = useAuth();
const alerts = useAlerts();

export async function authGuard() {
  await auth.loadUser();

  if (!auth.isLoggedIn()) {
    alerts.danger(
      'Du bist nicht eingeloggt.',
      'Bitte logge dich ein um fortzufahren.',
    );
    return { name: 'login' };
  }
}

export async function guestGuard() {
  await auth.loadUser();

  if (auth.isLoggedIn()) {
    return { name: 'dashboard' };
  }
}
