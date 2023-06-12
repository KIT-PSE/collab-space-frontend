import { useAlerts } from '@/composables/alerts';
import { useAuth, useUser } from '@/composables/auth';
import { RouteLocationNormalized } from 'vue-router';
import { useChannel } from '@/composables/channel';

const alerts = useAlerts();

export async function authGuard() {
  const auth = useAuth();
  await auth.loadUser();

  if (!auth.isLoggedIn) {
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

  if (auth.isLoggedIn) {
    return { name: 'dashboard' };
  }
}

export async function roomGuard(to: RouteLocationNormalized) {
  const auth = useAuth();
  await auth.loadUser();

  const channel = useChannel();

  if (channel.state.connected) {
    return;
  }

  try {
    if (auth.isLoggedIn) {
      await channel.joinAsTeacher(useUser().value, to.params.id as string);
    } else {
      await channel.joinAsStudent('through link', to.params.id as string);
    }
  } catch (err) {
    alerts.error('Raum beitreten fehlgeschlagen', err as Error);
    return { name: 'home' };
  }
}

export async function adminGuard() {
  const auth = useAuth();
  await auth.loadUser();

  if (!auth.isAdmin) {
    alerts.danger(
      'Du bist nicht berechtigt.',
      'Du musst Administrator sein um fortzufahren.',
    );
    return { name: 'dashboard' };
  }
}
