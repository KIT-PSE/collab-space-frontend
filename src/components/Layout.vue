<template>
  <main class="container">
    <div class="row mt-2 justify-content-between">
      <div class="col-auto d-flex align-items-center">
        <router-link to="/dashboard">
          <img src="@/assets/textless-logo.png" alt="CollabSpace" width="100" />
        </router-link>
        <h1 class="mb-0 ms-4">{{ title }}</h1>
      </div>
      <div class="col-auto d-flex align-items-center">
        <slot name="buttons"></slot>
        <router-link
          v-if="auth.isAdmin && buttons?.includes('admin')"
          to="/admin"
          class="btn btn-primary mx-1"
        >
          <i class="fa fa-gear"></i>
          Admin Panel
        </router-link>
        <router-link
          v-if="buttons?.includes('account')"
          to="/account"
          class="btn btn-primary mx-1"
        >
          <i class="fa fa-gear"></i>
          {{ auth.user?.name }}
        </router-link>
        <router-link
          v-if="buttons?.includes('back')"
          to="/dashboard"
          class="btn btn-primary mx-1"
        >
          <i class="fa fa-circle-left"></i>
          Zurück
        </router-link>
        <button class="btn text-primary mx-1" @click="auth.logout">
          <i class="fa-solid fa-right-from-bracket fa-lg"></i>
          Ausloggen
        </button>
        <button class="btn btn-secondary mx-1">
          Timer:
          <span class="font-monospace">{{ auth.loginTimer?.state.time }}</span>
        </button>
        <button class="btn btn-secondary mx-1">
          <span v-if="channel.connected">Verbunden</span>
          <span v-else>Nicht verbunden</span>
        </button>
      </div>
    </div>

    <slot></slot>
  </main>
</template>

<script setup lang="ts">
  import { useAuth } from '@/composables/auth';
  import { useChannel } from '@/composables/channel';

  defineProps<{
    title: string;
    buttons?: ('account' | 'back' | 'admin')[];
  }>();

  const auth = useAuth();
  const channel = useChannel();
</script>
