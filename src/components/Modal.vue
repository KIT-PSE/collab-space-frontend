<template>
  <div
    class="modal fade"
    tabindex="-1"
    v-on="{ 'hidden.bs.modal': onHidden, 'shown.bs.modal': onShow }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Schließen"
          ></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="btn"
            :class="
              submitText && ['Löschen', 'Schließen'].includes(submitText)
                ? 'btn-danger'
                : 'btn-primary'
            "
            @click="$emit('submit')"
          >
            {{ submitText || 'Speichern' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    submitText?: string;
  }>();

  const emits = defineEmits<{
    submit: [];
    closed: [];
    open: [];
  }>();

  /**
   * Function called when the component or element is hidden or closed.
   * It emits a custom event named 'closed'.
   */
  function onHidden() {
    emits('closed');
  }

  /**
   * Function called when the component or element is shown or opened.
   * It emits a custom event named 'open'.
   */
  function onShow() {
    emits('open');
  }
</script>
