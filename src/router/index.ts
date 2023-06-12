import { createRouter, createWebHistory } from 'vue-router';
import { adminGuard, authGuard, guestGuard, roomGuard } from '@/router/guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/EnterRoomView.vue'),
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
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: [authGuard, adminGuard],
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
      path: '/room/:id',
      name: 'room',
      component: () => import('../views/RoomView.vue'),
      beforeEnter: roomGuard,
    },
    {
      path: '/room/:id/connecting',
      name: 'connecting',
      component: () => import('../views/PreRoomView.vue'),
      beforeEnter: roomGuard,
    },
  ],
});

export default router;
