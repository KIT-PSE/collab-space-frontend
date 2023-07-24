<template>
  <div
    class="w-100 h-100 rounded bg-white shadow border-1 border border-opacity-50 border-black"
  >
    <div class="d-flex flex-column h-100 p-3">
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

      <div class="mt-2" v-if="selectedNote === 0">
        <ul class="list-group">
          <li
            v-for="note in notes.notesList"
            :key="note.id"
            class="list-group-item list-group-item-action"
            @click="setSelectedNote(note.id)"
          >
            {{ note.name }}
          </li>
        </ul>
        <ul class="list-group mt-2">
          <li
            role="button"
            class="list-group-item list-group-item-action"
            @click="setSelectedNote(-1)"
          >
            <i class="fa fa-plus me-2"></i>
            Eine neue Notiz erstellen
          </li>
        </ul>
      </div>

      <div class="mt-2" v-if="selectedNote === -1">
        <div class="d-flex align-items-center">
          <button
            class="btn btn-sm text-secondary me-1"
            @click="setSelectedNote(0)"
          >
            <i class="fa fa-arrow-left"></i>
          </button>
          Neue Notiz erstellen
        </div>
        <input
          class="form-control mt-3"
          placeholder="Name der Notiz"
          v-model="newNoteName"
        />
        <button class="btn btn-primary mt-2 w-100" @click="createNote">
          Notiz erstellen
        </button>
      </div>

      <div
        class="mt-2 flex-fill d-flex flex-column"
        v-if="selectedNote > 0 && notes.getNoteById(selectedNote)"
      >
        <div class="d-flex align-items-center">
          <button
            class="btn btn-sm text-secondary me-1"
            @click="setSelectedNote(0)"
          >
            <i class="fa fa-arrow-left"></i>
          </button>
          {{ notes.getNoteById(selectedNote)!.name }}
        </div>
        <textarea
          class="form-control mt-2 h-100"
          rows="10"
          v-model="notes.getNoteById(selectedNote)!.content"
          @keyup="updateNote"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChannel } from '@/composables/channel/channel';
  import { ref } from 'vue';

  const emit = defineEmits(['close']);
  // selectedNote: -1 is new Note; 0 is no Note selected
  const selectedNote = ref(0);
  const newNoteName = ref('');

  const channel = useChannel();
  const notes = channel.loadNotes();

  function setSelectedNote(id: number) {
    selectedNote.value = id;
  }

  async function createNote() {
    const name = newNoteName.value.trim();
    if (name.length === 0) {
      // TODO: Fehlerbehandlung
      return;
    }
    const id = await notes.addNote(name);

    setSelectedNote(id);
  }

  function updateNote(payload: KeyboardEvent) {
    notes.updateNote(
      selectedNote.value,
      (payload.target as HTMLTextAreaElement).value,
    );
  }

  function close() {
    emit('close');
  }
</script>
