import { Socket } from 'socket.io-client';
import { reactive } from 'vue';
import { useApi } from '@/composables/api';

/**
 * The note object that is used to represent a note
 * @property id - The id of the note
 * @property name - The name of the note
 * @property content - The content of the note
 */
export interface Note {
  id: number;
  name: string;
  content: string;
}

/**
 *  Composable that contains all the functions and variables related to the integrated Notes.
 */
export class Notes {
  public notesList = reactive([] as Note[]);

  constructor(
    private readonly socket: Socket,
    private readonly roomId: number,
    private readonly categoryId: number,
  ) {
    this.load(roomId, categoryId);

    socket.on('note-added', (note: Note) => {
      this.notesList.push(note);
    });

    socket.on(
      'note-updated',
      ({ noteId, content }: { noteId: number; content: string }) => {
        const note = this.getNote(noteId);
        if (note) {
          note.content = content;
        }
      },
    );

    socket.on('note-deleted', ({ noteId }: { noteId: number }) => {
      const noteIndex = this.notesList.findIndex((note) => note.id === noteId);
      if (noteIndex !== -1) {
        this.notesList.splice(noteIndex, 1);
      }
    });
  }

  /**
   * Loads alle the notes from the server
   * @param roomId - The id of the room
   * @param categoryId - The id of the category
   */
  async load(roomId: number, categoryId: number) {
    const api = useApi();
    const notesResult = await api.getNotes(roomId, categoryId);
    this.notesList.push(...notesResult);
  }

  /**
   * Gets a note by its id
   * @param noteId - The id of the note
   */
  public getNote(noteId: number) {
    return this.notesList.find((note) => note.id === noteId);
  }

  /**
   * Adds a note to the server
   * @param name - The name of the note
   */
  public add(name: string): Promise<number> {
    return new Promise((resolve) => {
      this.socket.emit('add-note', { name }, (response: { id: number }) => {
        this.notesList.push({
          id: response.id,
          name,
          content: '',
        });

        resolve(response.id);
      });
    });
  }

  /**
   * Updates a note on the server
   * @param noteId - The id of the note
   * @param content - The content of the note
   */
  public update(noteId: number, content: string) {
    this.socket.emit('update-note', { noteId, content });
  }

  /**
   * Deletes a note on the server
   * @param noteId - The id of the note
   */
  public delete(noteId: number) {
    this.socket.emit('delete-note', { noteId });
  }

  /**
   * Downloads a note from the server
   * @param noteId - The id of the note
   */
  public download(noteId: number) {
    const note = this.getNote(noteId);
    if (note) {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(note.content || ''),
      );
      element.setAttribute('download', note.name.endsWith('.txt') ? note.name : note.name + '.txt');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }
}
