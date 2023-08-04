<template>
  <nav class="navbar bg-body-tertiary px-2 sticky-top shadow-sm">
    <div class="container">
      <router-link
        class="navbar-brand d-flex align-items-center"
        to="/dashboard"
      >
        <img
          src="@/assets/textless-logo.png"
          alt="CollabSpace"
          height="36"
          class="me-3"
        />
        {{ title }}
      </router-link>

      <span class="flex-grow-1"></span>

      <button class="btn btn-secondary mx-1" v-if="dev">
        Timer:
        <span class="font-monospace">
          {{ auth.state.loginTimer?.state.time }}
        </span>
      </button>
      <button class="btn btn-secondary mx-1" v-if="dev">
        <span v-if="channel.state.connected">Verbunden</span>
        <span v-else>Nicht verbunden</span>
      </button>

      <router-link
        v-if="buttons?.includes('back')"
        to="/dashboard"
        class="btn btn-primary mx-1"
      >
        <i class="fa fa-circle-left"></i>
        Zurück
      </router-link>

      <div class="dropdown">
        <button
          class="btn mx-1"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {{ auth.state.user?.name }}
          <i class="fa-solid fa-user ms-2"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <router-link v-if="auth.isAdmin" to="/admin" class="dropdown-item">
              Admin Panel
            </router-link>
          </li>
          <li>
            <router-link to="/account" class="dropdown-item">
              Account
            </router-link>
          </li>
          <li>
            <button class="dropdown-item" @click="auth.logout">
              Ausloggen
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <main class="container flex-grow-1 pt-5">
    <slot></slot>
  </main>
</template>

<script setup lang="ts">
  import { useAuth } from '@/composables/auth';
  import { useChannel } from '@/composables/channel/channel';

  defineProps<{
    title: string;
    buttons?: ('account' | 'back' | 'admin')[];
  }>();

  const auth = useAuth();
  const channel = useChannel();

  const dev = import.meta.env.DEV && false;
</script>
