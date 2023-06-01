<template>
  <div id="alerts">
    <transition-group name="bounce">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="d-flex justify-content-center"
      >
        <div
          class="alert alert-dismissible shadow"
          :class="'alert-' + alert.type"
          role="alert"
        >
          <h5 class="alert-heading mb-0">{{ alert.title }}</h5>
          <p v-if="alert.message" class="mt-2 mb-0" v-html="alert.message"></p>
          <button
            type="button"
            class="btn-close"
            aria-label="Schließen"
            @click="alert.remove()"
          ></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
  import { useAlerts } from '@/composables/alerts';

  const { alerts } = useAlerts();
</script>

<style scoped>
  #alerts {
    position: fixed;
    z-index: 10000;
    top: 0;
    left: 0;
    width: 100%;
    padding: 2rem;
    pointer-events: none;
  }

  .alert {
    pointer-events: all;
  }
</style>
