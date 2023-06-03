<template>
  <Modal
    id="prompt-modal"
    :title="prompt.title"
    :submit-text="prompt.submitText"
    v-on="{ 'hide.bs.modal': onHide }"
    @submit="submit"
  >
    <span v-html="prompt.message"></span>
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/components/Modal.vue';
  import { State, usePrompt } from '@/composables/prompt';
  import {closeModal} from "@/utils";

  const prompt = usePrompt();

  function onHide() {
    if (prompt.state === State.WAITING) {
      prompt.state = State.NO;
    }
  }

  function submit() {
    if (prompt.state === State.WAITING) {
      prompt.state = State.YES;
    }

    closeModal('prompt-modal');
  }
</script>