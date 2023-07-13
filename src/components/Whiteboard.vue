<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black position-relative"
  >
    <div class="position-absolute top-0 end-0 p-1 z-1">
      <button class="btn btn-sm text-secondary" @click="expand">
        <i class="fa fa-up-right-and-down-left-from-center"></i>
      </button>
      <button class="btn btn-sm text-secondary" @click="close">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <canvas
      id="whiteboard"
      :width="$props.width"
      :height="$props.height"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue';
  import { fabric } from 'fabric';

  const props = defineProps<{
    width: number;
    height: number;
  }>();

  watch(() => props.width, updateDimensions);
  watch(() => props.height, updateDimensions);

  const emit = defineEmits(['close', 'expand']);

  let canvas: fabric.Canvas;

  onMounted(() => {
    canvas = new fabric.Canvas('whiteboard', {
      isDrawingMode: true,
    });

    canvas.on('path:created', (e) => {
      console.log(e);
    });
  });

  function updateDimensions() {
    canvas.setDimensions({
      width: props.width,
      height: props.height,
    });
    canvas.calcOffset();
  }

  function close() {
    emit('close');
  }

  function expand() {
    emit('expand');
  }
</script>

<style scoped></style>
