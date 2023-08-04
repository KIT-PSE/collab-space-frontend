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

          <button
            class="btn btn-sm text-secondary ms-auto"
            @click="notes.downloadNote(selectedNote)"
          >
            <i class="fa fa-download"></i>
          </button>

          <button class="btn btn-sm text-secondary ms-1" @click="deleteNote">
            <i class="fa fa-trash"></i>
          </button>
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
  import { ask } from '@/composables/prompt';

  const emit = defineEmits(['close']);
  // selectedNote: -1 is new Note; 0 is no Note selected
  const selectedNote = ref(0);
  const newNoteName = ref('');

  const channel = useChannel();
  const notes = channel.loadNotes();

  /**
   * Sets the selected note to the provided 'id'.
   * @param id - The ID of the note to be selected.
   */
  function setSelectedNote(id: number) {
    selectedNote.value = id;
  }

  /**
   * Creates a new note with the name specified in 'newNoteName' and sets it as the selected note.
   * If the note name is empty, it returns early without creating the note.
   */
  async function createNote() {
    const name = newNoteName.value.trim();
    if (name.length === 0) {
      // TODO: Fehlerbehandlung
      return;
    }
    const id = await notes.addNote(name);
    newNoteName.value = '';
    setSelectedNote(id);
  }

  /**
   * Updates the content of the currently selected note with the new text provided in 'payload'.
   * @param payload - The keyboard event containing the updated text.
   */
  function updateNote(payload: KeyboardEvent) {
    notes.updateNote(
      selectedNote.value,
      (payload.target as HTMLTextAreaElement).value,
    );
  }

  /**
   * Prompts the user to confirm note deletion. If confirmed, deletes the currently selected note.
   * After deletion, sets the selected note to the first note (ID 0).
   */
  async function deleteNote() {
    const shouldDelete = await ask(
      'Wirklich löschen?',
      'Möchtest du diese Notiz wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
      'Löschen',
    );

    if (shouldDelete) {
      notes.deleteNoteById(selectedNote.value);
      setSelectedNote(0);
    }
  }

  /**
   * Emits a custom event named 'close'.
   */
  function close() {
    emit('close');
  }
</script>
