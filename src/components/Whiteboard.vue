<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black position-relative"
  >
    <div
      class="position-absolute start-0 top-50 translate-middle-y d-flex flex-column z-1 ps-2"
    >
      <button
        class="btn btn-sm text-secondary bg-white"
        :class="{ 'border border-secondary': tool === Tool.Select }"
        @click="setTool(Tool.Select)"
      >
        <i class="fa fa-arrow-pointer"></i>
      </button>
      <button
        class="btn btn-sm text-secondary bg-white"
        :class="{ 'border border-secondary': tool === Tool.Pen }"
        @click="setTool(Tool.Pen)"
      >
        <i class="fa fa-pen"></i>
      </button>
      <!-- eraser -->
      <button
        class="btn btn-sm text-secondary bg-white"
        :class="{ 'border border-secondary': tool === Tool.Eraser }"
        @click="setTool(Tool.Eraser)"
      >
        <i class="fa fa-eraser"></i>
      </button>
    </div>
    <div class="position-absolute top-0 end-0 p-1 z-1">
      <button class="btn btn-sm text-secondary bg-white" @click="zoomIn">
        <i class="fa fa-magnifying-glass-plus"></i>
      </button>
      <button class="btn btn-sm text-secondary bg-white" @click="zoomOut">
        <i class="fa fa-magnifying-glass-minus"></i>
      </button>
      <button class="btn btn-sm text-secondary bg-white" @click="exportAsImage">
        <i class="fa fa-download"></i>
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
  import {useChannel} from '@/composables/channel/channel';

  enum Tool {
    Pen = 'pen',
    Select = 'select',
    Eraser = 'eraser',
  }

  const props = defineProps<{
    width: number;
    height: number;
    whiteboard: Whiteboard;
  }>();
  const emit = defineEmits(['close', 'expand']);

  const tool = ref<Tool>(Tool.Pen);

  watch(() => props.width, updateDimensions);
  watch(() => props.height, updateDimensions);

  const canvas = ref<fabric.Canvas>();
  const maxCanvasWidth = 2500;
  const maxCanvasHeight = 2500;
  const minZoomLevel = 0.5;
  const maxZoomLevel = 2;

  const channel = useChannel();
  watch(() => channel.hasCurrentUserPermission, (permission: boolean) => {
    if (!canvas.value || tool.value === Tool.Select) {
      return;
    }

    canvas.value!.isDrawingMode = permission;
  })

  /**
   * Constants for the viewportTransform array of the canvas.
   * See http://fabricjs.com/docs/fabric.Canvas.html#viewportTransform
   */
  const VIEWPORT_TRANSFORM_WIDTH_INDEX = 4;
  const VIEWPORT_TRANSFORM_HEIGHT_INDEX = 5;

  onMounted(async () => {
    canvas.value = new fabric.Canvas('whiteboard', {
      isDrawingMode: channel.hasCurrentUserPermission,
      selection: false,
    });

    canvas.value.on('path:created', () => {
      const canvasJSON = canvas.value?.toJSON();
      props.whiteboard.change(JSON.stringify(canvasJSON));
    });

    props.whiteboard.onChanges((canvasJson) => {
      if (!canvasJson) {
        return;
      }
      canvas.value?.loadFromJSON(JSON.parse(canvasJson), () => {});
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

  function setTool(newTool: Tool) {
    const canvasRef = canvas.value!;
    if (newTool === Tool.Select) {
      canvasRef.isDrawingMode = false;
      canvasRef.hoverCursor = 'move';
      // Disable selection of objects because sync is not implemented
      canvasRef.discardActiveObject();
      canvasRef.renderAll();
      canvasRef.forEachObject((o) => {
        o.selectable = false;
      });
    } else {
      canvasRef.isDrawingMode = channel.hasCurrentUserPermission;
      canvasRef.hoverCursor = 'crosshair';

      switch (newTool) {
        case Tool.Pen:
          canvasRef.freeDrawingBrush = new fabric.PencilBrush(canvasRef);
          canvasRef.freeDrawingBrush.width = 1;
          break;
        case Tool.Eraser:
          // @ts-ignore
          canvasRef.freeDrawingBrush = new fabric.EraserBrush(canvasRef);
          canvasRef.freeDrawingBrush.width = 20;
          break;
      }
    }

    tool.value = newTool;
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

  function exportAsImage() {
    const data = canvas.value?.toDataURL({
      width: maxCanvasWidth,
      height: maxCanvasHeight,
      left: 0,
      top: 0,
      format: 'png',
    });

    if (data) {
      const element = document.createElement('a');
      element.setAttribute('href', data);
      element.setAttribute('download', 'whiteboard_' + Date.now() + '.png');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

  function close() {
    emit('close');
  }

  function expand() {
    emit('expand');
  }
</script>
