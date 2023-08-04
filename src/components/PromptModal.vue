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
  import { closeModal } from '@/utils';

  const prompt = usePrompt();

  /**
   * Event handler function called when the "prompt-modal" is hidden or closed.
   * If the prompt state is in the "WAITING" state, it updates the prompt state to "NO".
   */
  function onHide() {
    if (prompt.state === State.WAITING) {
      prompt.state = State.NO;
    }
  }

  /**
   * Event handler function called when the user submits the prompt response.
   * If the prompt state is in the "WAITING" state, it updates the prompt state to "YES".
   * It then closes the "prompt-modal" by calling the "closeModal()" function.
   */
  function submit() {
    if (prompt.state === State.WAITING) {
      prompt.state = State.YES;
    }

    closeModal('prompt-modal');
  }
</script>
