<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black position-relative"
  >
    <div
      class="position-absolute start-0 top-50 translate-middle-y d-flex flex-column z-1 ps-2"
    >
      <button
        class="btn btn-sm text-secondary bg-white"
        :class="{ 'border border-secondary': !canvas?.isDrawingMode }"
        @click="togglePanMode"
      >
        <i class="fa fa-arrow-pointer"></i>
      </button>
      <button
        class="btn btn-sm text-secondary bg-white"
        :class="{ 'border border-secondary': canvas?.isDrawingMode }"
        @click="togglePanMode"
      >
        <i class="fa fa-pen"></i>
      </button>
    </div>
    <div class="position-absolute top-0 end-0 p-1 z-1">
      <button class="btn btn-sm text-secondary bg-white" @click="zoomIn">
        <i class="fa fa-magnifying-glass-plus"></i>
      </button>
      <button class="btn btn-sm text-secondary bg-white" @click="zoomOut">
        <i class="fa fa-magnifying-glass-minus"></i>
      </button>
      <button class="btn btn-sm text-secondary bg-white" @click="expand">
        <i class="fa fa-up-right-and-down-left-from-center"></i>
      </button>
      <button class="btn btn-sm text-secondary bg-white" @click="close">
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
  import { onMounted, ref, watch } from 'vue';
  import { fabric } from 'fabric';

  const props = defineProps<{
    width: number;
    height: number;
  }>();
  const emit = defineEmits(['close', 'expand']);

  watch(() => props.width, updateDimensions);
  watch(() => props.height, updateDimensions);

  const canvas = ref<fabric.Canvas | null>(null);
  const maxCanvasWidth = 2500;
  const maxCanvasHeight = 2500;
  const minZoomLevel = 0.5;
  const maxZoomLevel = 2;

  onMounted(() => {
    canvas.value = new fabric.Canvas('whiteboard', {
      isDrawingMode: true,
      selection: false,
    });

    canvas.value.on('path:created', (e) => {
      console.log(e);
    });

    canvas.value.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      zoomCanvas(zoom, { x: opt.e.offsetX, y: opt.e.offsetY });
      opt.e.preventDefault();
      opt.e.stopPropagation();
      let vpt = this.viewportTransform;
      if (zoom < 0.4) {
        vpt![4] = 200 - (maxCanvasWidth * zoom) / 2;
        vpt![5] = 200 - (maxCanvasHeight * zoom) / 2;
      } else {
        if (vpt![4] >= 0) {
          vpt![4] = 0;
        } else if (vpt![4] < this.getWidth() - maxCanvasWidth * zoom) {
          vpt![4] = this.getWidth() - maxCanvasWidth * zoom;
        }
        if (vpt![5] >= 0) {
          vpt![5] = 0;
        } else if (vpt![5] < this.getHeight() - maxCanvasHeight * zoom) {
          vpt![5] = this.getHeight() - maxCanvasHeight * zoom;
        }
      }
    });
    canvas.value.on('mouse:down', function (opt) {
      const evt = opt.e;
      if (evt.altKey && !this.isDrawingMode) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });
    canvas.value.on('mouse:move', function (opt) {
      if (this.isDragging) {
        const e = opt.e;
        const zoom = this.getZoom();
        let vpt = this.viewportTransform;
        if (zoom < 0.4) {
          vpt![4] = 200 - (maxCanvasWidth * zoom) / 2;
          vpt![5] = 200 - (maxCanvasHeight * zoom) / 2;
        } else {
          vpt![4] += e.clientX - this.lastPosX;
          vpt![5] += e.clientY - this.lastPosY;
          if (vpt![4] >= 0) {
            vpt![4] = 0;
          } else if (vpt![4] < this.getWidth() - maxCanvasWidth * zoom) {
            vpt![4] = this.getWidth() - maxCanvasWidth * zoom;
          }
          if (vpt![5] >= 0) {
            vpt![5] = 0;
          } else if (vpt![5] < this.getHeight() - maxCanvasHeight * zoom) {
            vpt![5] = this.getHeight() - maxCanvasHeight * zoom;
          }
        }
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });
    canvas.value.on('mouse:up', function (opt) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });
  });

  function togglePanMode() {
    canvas.value!.isDrawingMode = !canvas.value!.isDrawingMode;
    // Disable selection of objects because sync is not implemented
    canvas.value?.discardActiveObject();
    canvas.value?.renderAll();
    canvas.value?.forEachObject((o) => {
      o.selectable = false;
    });
  }

  function zoomIn() {
    let zoom = canvas.value?.getZoom() * 1.25;
    zoomCanvas(zoom);
  }

  function zoomOut() {
    let zoom = canvas.value?.getZoom() / 1.25;
    zoomCanvas(zoom);
  }

  function zoomCanvas(zoomValue: number, point?: fabric.IPoint) {
    if (canvas.value != null) {
      if (zoomValue > maxZoomLevel) zoomValue = maxZoomLevel;
      if (zoomValue < minZoomLevel) zoomValue = minZoomLevel;
      canvas.value?.zoomToPoint(
        point ?? {
          x: canvas.value?.getWidth() / 2,
          y: canvas.value?.getHeight() / 2,
        },
        zoomValue,
      );
    }
  }

  function updateDimensions() {
    canvas.value?.setDimensions({
      width: props.width,
      height: props.height,
    });
    canvas.value?.calcOffset();
  }

  function close() {
    emit('close');
  }

  function expand() {
    emit('expand');
  }
</script>
