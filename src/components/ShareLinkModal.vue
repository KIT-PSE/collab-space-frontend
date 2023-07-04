<template>
  <Modal
    id="share-link-modal"
    title="Link teilen"
    submit-text="Kopieren"
    @submit="submit"
  >
    <textarea
      class="form-control"
      rows="6"
      :value="createShareText()"
      readonly
    />
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/components/Modal.vue';
  import { closeModal } from '@/utils';
  import { ChannelState } from '@/composables/channel';

  const props = defineProps<{
    channel: ChannelState;
  }>();

  function submit() {
    navigator.clipboard.writeText(createShareText());
    closeModal('share-link-modal');
  }

  function createShareText() {
    // TODO: Add Password if needed
    return `Trete dem CollabSpace Raum bei:\n\nLink: ${window.location.origin}/room/${props.channel.room?.channelId}\nCode: ${props.channel.room?.channelId}`;
  }
</script>
