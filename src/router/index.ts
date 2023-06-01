import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, guestGuard } from '@/router/guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: guestGuard,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: guestGuard,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: guestGuard,
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: authGuard,
    },
    {
      path: '/room',
      name: 'room',
      component: () => import('../views/RoomView.vue'),
      beforeEnter: authGuard,
    },
  ],
});

export default router;
