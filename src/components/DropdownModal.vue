<template>
  <Modal
      id="dropdown-modal"
      submit-text="Zugriff ändern"
      @submit="submit"
      @click.self="closeModal"
  >

  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal.vue';
import { closeModal } from '@/utils';
import { useChannel } from '@/composables/channel';
import {ref} from "vue";


const props = defineProps<{
  studentId: string;
  channel: useChannel;
}>();


const selectedStudentId = ref<string | null>(null);

function submit() {
  props.channel.updatePermission(props.studentId);
  closeModal('dropdown-modal');
}


</script>
