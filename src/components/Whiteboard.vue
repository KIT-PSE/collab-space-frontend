<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black position-relative"
  >
    <div class="position-absolute top-0 end-0 p-1">
      <button class="btn btn-sm text-secondary" @click="expand">
        <i class="fa fa-up-right-and-down-left-from-center"></i>
      </button>
      <button class="btn btn-sm text-secondary" @click="close">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <canvas id="whiteboard" width="100%" height="100%"></canvas>
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits(['close', 'expand']);

  function close() {
    emit('close');
  }

  function expand() {
    emit('expand');
  }
</script>

<style scoped></style>
