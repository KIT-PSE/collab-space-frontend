import { createRouter, createWebHistory } from 'vue-router';
import { adminGuard, authGuard, guestGuard, roomGuard } from '@/router/guards';

/**
 * Create the Vue Router instance and define the routes.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**
     * Home Route
     */
    {
      path: '/',
      name: 'home',
      component: () => import('../views/EnterRoomView.vue'),
      beforeEnter: guestGuard,
    },
    /**
     * Login Route
     */
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: guestGuard,
    },
    /**
     * Register Route
     */
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: guestGuard,
    },
    /**
     * Admin Route
     */
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: [authGuard, adminGuard],
    },
    /**
     * Account Route
     */
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      beforeEnter: authGuard,
    },
    /**
     * Dashboard Route
     */
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: authGuard,
    },
    /**
     * Room Route
     */
    {
      path: '/room/:id',
      name: 'room',
      component: () => import('../views/RoomView.vue'),
      beforeEnter: roomGuard,
    },
    /**
     * Connecting Route
     */
    {
      path: '/room/:id/connecting',
      name: 'connecting',
      component: () => import('../views/PreRoomView.vue'),
      beforeEnter: roomGuard,
    },
  ],
});

export default router;
