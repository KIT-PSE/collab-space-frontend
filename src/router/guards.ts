import { useAlerts } from '@/composables/alerts';
import { useAuth, useUser } from '@/composables/auth';
import { RouteLocationNormalized } from 'vue-router';
import { useChannel } from '@/composables/channel/channel';

const alerts = useAlerts();

/**
 * Route guard to check if the user is logged in and authenticated.
 * If the user is not logged in, it shows an error alert and redirects to the login page.
 * @returns  The route to navigate to in case of failure (if the user is not logged in).
 */
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

/**
 * Route guard to check if the user is a guest (not logged in).
 * If the user is logged in, it redirects to the dashboard page.
 *
 * @returns The route to navigate to in case of failure (if the user is logged in).
 */
export async function guestGuard() {
  const auth = useAuth();
  await auth.loadUser();

  if (auth.isLoggedIn) {
    return { name: 'dashboard' };
  }
}

/**
 * Route guard to check if the user is allowed to access a room.
 * It ensures the user is either a teacher or a student and handles joining the channel for the room.
 *
 * @param to - The target route that the user is trying to access.
 * @returns The route to navigate to in case of failure or undefined if the guard allows access.
 */
export async function roomGuard(to: RouteLocationNormalized) {
  const auth = useAuth();
  await auth.loadUser();

  const channel = useChannel();

  if (channel.state.connected) {
    return;
  }

  try {
    if (auth.isLoggedIn) {
      await channel.joinAsTeacher(to.params.id as string, useUser().value);
    } else {
      await channel.joinAsStudent(to.params.id as string);

      if (!channel.state.hasName && to.name === 'room') {
        return { name: 'connecting', params: { id: to.params.id } };
      }
    }
  } catch (err) {
    if (err === 'Wrong password') {
      return { name: 'home', query: { code: to.params.id } };
    }

    if (err === 'Not authorized') {
      alerts.danger(
        'Raum beitreten fehlgeschlagen',
        `Du darfst diesen Raum nicht als Lehrer betreten, da du nicht der Besitzer bist.<br>
        Logge dich aus um den Raum als Schüler zu betreten.`,
      );

      return { name: 'home' };
    }

    alerts.error('Raum beitreten fehlgeschlagen', err as Error);
    return { name: 'home' };
  }
}

/**
 * Route guard to check if the user is an administrator.
 * It ensures that the user is logged in and has the role of 'admin'.
 * If the user is not an administrator, it shows an error alert and redirects to the dashboard.
 *
 * @returns The route to navigate to in case the user is not an administrator or undefined if the guard allows access.
 */
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
