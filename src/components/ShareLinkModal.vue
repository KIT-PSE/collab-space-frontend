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
  import { ChannelState } from '@/composables/channel/channel';

  const props = defineProps<{
    channel: ChannelState;
  }>();

  /**
   * Function that generates the share text using 'createShareText()' and writes it to the clipboard.
   * It then closes the 'share-link-modal' modal.
   */
  function submit() {
    navigator.clipboard.writeText(createShareText());
    closeModal('share-link-modal');
  }

  /**
   * Function that generates the share text for the CollabSpace room, including the link, code, and password (if applicable).
   * @returns The share text for the CollabSpace room.
   */
  function createShareText() {
    const { channelId, password = '' } = props.channel.room ?? {};
    const passwordText = password ? `&password=${password}` : '';
    const passwordLine = password ? `Passwort: ${password}` : '';

    return `Trete dem CollabSpace Raum bei:

      Link: ${window.location.origin}/?code=${channelId ?? ''}${passwordText}
      Code: ${channelId ?? ''}
      ${passwordLine}`;
  }
</script>
