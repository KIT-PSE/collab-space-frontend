<template>
  <div
    class="modal fade"
    tabindex="-1"
    v-on="{ 'hidden.bs.modal': onHidden, 'shown.bs.modal': onShow }"
  >
    <div class="modal-dialog">
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
            :class="submitText === 'Löschen' ? 'btn-danger' : 'btn-primary'"
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

  function onHidden() {
    emits('closed');
  }

  function onShow() {
    emits('open');
  }
</script>
