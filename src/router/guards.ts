import { useAlerts } from '@/composables/alerts';
import { useAuth } from '@/composables/auth';

const alerts = useAlerts();

export async function authGuard() {
  const auth = useAuth();

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
  const auth = useAuth();
  await auth.loadUser();

  if (auth.isLoggedIn()) {
    return { name: 'dashboard' };
  }
}
