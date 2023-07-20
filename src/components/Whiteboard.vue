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
  import { Whiteboard } from '@/composables/channel/whiteboard';

  const props = defineProps<{
    width: number;
    height: number;
    whiteboard: Whiteboard;
  }>();
  const emit = defineEmits(['close', 'expand']);

  watch(() => props.width, updateDimensions);
  watch(() => props.height, updateDimensions);

  const canvas = ref<fabric.Canvas | null>(null);
  const maxCanvasWidth = 2500;
  const maxCanvasHeight = 2500;
  const minZoomLevel = 0.5;
  const maxZoomLevel = 2;

  /**
   * Constants for the viewportTransform array of the canvas.
   * See http://fabricjs.com/docs/fabric.Canvas.html#viewportTransform
   */
  const VIEWPORT_TRANSFORM_WIDTH_INDEX = 4;
  const VIEWPORT_TRANSFORM_HEIGHT_INDEX = 5;

  onMounted(async () => {
    canvas.value = new fabric.Canvas('whiteboard', {
      isDrawingMode: true,
      selection: false,
    });

    const savedCanvas = await props.whiteboard.loadCanvas();
    if (savedCanvas) {
      canvas.value?.loadFromJSON(JSON.parse(savedCanvas), () => {
        console.info('Loaded canvas as JSON from Server');
      });
    }

    canvas.value.on('path:created', (e) => {
      // @ts-ignore
      props.whiteboard.change(e.path);
    });

    props.whiteboard.onChanges((path) => {
      const newPath = new fabric.Path(path.path, {
        ...path,
      });
      canvas.value?.add(newPath);
    });

    /**
     * Zooms the canvas in or out, keeping the specified point in the center of the viewport.
     * For implementation details, see http://fabricjs.com/fabric-intro-part-5
     */
    canvas.value.on('mouse:wheel', function (this: any, opt: any) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      zoomCanvas(zoom, { x: opt.e.offsetX, y: opt.e.offsetY });
      opt.e.preventDefault();
      opt.e.stopPropagation();
      let viewportTransform = this.viewportTransform;
      if (zoom < 0.4) {
        viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] =
          200 - (maxCanvasWidth * zoom) / 2;
        viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] =
          200 - (maxCanvasHeight * zoom) / 2;
      } else {
        if (viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] >= 0) {
          viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] = 0;
        } else if (
          viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] <
          this.getWidth() - maxCanvasWidth * zoom
        ) {
          viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] =
            this.getWidth() - maxCanvasWidth * zoom;
        }
        if (viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] >= 0) {
          viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] = 0;
        } else if (
          viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] <
          this.getHeight() - maxCanvasHeight * zoom
        ) {
          viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] =
            this.getHeight() - maxCanvasHeight * zoom;
        }
      }
    });

    /**
     * Pans the canvas when the user drags the mouse if pan tool selected.
     * For implementation details, see http://fabricjs.com/fabric-intro-part-5
     */
    canvas.value.on('mouse:down', function (this: any, opt: any) {
      const event = opt.e;
      if (!this.isDrawingMode) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = event.clientX;
        this.lastPosY = event.clientY;
      }
    });
    canvas.value.on('mouse:move', function (this: any, opt: any) {
      if (this.isDragging) {
        const event = opt.e;
        const zoom = this.getZoom();
        let viewportTransform = this.viewportTransform;
        if (zoom < 0.4) {
          viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] =
            200 - (maxCanvasWidth * zoom) / 2;
          viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] =
            200 - (maxCanvasHeight * zoom) / 2;
        } else {
          viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] +=
            event.clientX - this.lastPosX;
          viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] +=
            event.clientY - this.lastPosY;
          if (viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] >= 0) {
            viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] = 0;
          } else if (
            viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] <
            this.getWidth() - maxCanvasWidth * zoom
          ) {
            viewportTransform![VIEWPORT_TRANSFORM_WIDTH_INDEX] =
              this.getWidth() - maxCanvasWidth * zoom;
          }
          if (viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] >= 0) {
            viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] = 0;
          } else if (
            viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] <
            this.getHeight() - maxCanvasHeight * zoom
          ) {
            viewportTransform![VIEWPORT_TRANSFORM_HEIGHT_INDEX] =
              this.getHeight() - maxCanvasHeight * zoom;
          }
        }
        this.requestRenderAll();
        this.lastPosX = event.clientX;
        this.lastPosY = event.clientY;
      }
    });
    canvas.value.on('mouse:up', function (this: any) {
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
    let zoom = canvas.value!.getZoom() * 1.25 || 1;
    zoomCanvas(zoom);
  }

  function zoomOut() {
    let zoom = canvas.value!.getZoom() / 1.25 || 1;
    zoomCanvas(zoom);
  }

  function zoomCanvas(zoomValue: number, point?: fabric.IPoint) {
    zoomValue = Math.max(Math.min(zoomValue, maxZoomLevel), minZoomLevel);
    canvas.value?.zoomToPoint(
      point ?? {
        x: canvas.value?.getWidth() / 2,
        y: canvas.value?.getHeight() / 2,
      },
      zoomValue,
    );
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
