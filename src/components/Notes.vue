<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black"
  >
    <!-- create a boostrap layout with one header row with title and close button and below some space for the notes -->
    <div class="col p-3">
      <div class="row">
        <div class="col-8">
          <h3>Notizen</h3>
        </div>
        <div class="col">
          <div class="d-flex justify-content-end">
            <button class="btn btn-sm text-secondary" @click="close">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div>
        <!-- display the notes in a list -->
        <ul class="list-group">
          <li
            v-for="note in notes.getNotes()"
            :key="note.id"
            class="list-group-item list-group-item-action"
          >
            {{ note.content }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChannel } from '@/composables/channel/channel';

  const emit = defineEmits(['close']);

  const channel = useChannel();

  const notes = channel.loadNotes();

  function close() {
    emit('close');
  }
</script>
