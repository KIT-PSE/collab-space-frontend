import { Socket } from 'socket.io-client';
import { reactive } from 'vue';
import { useApi } from '@/composables/api';

export interface Note {
  id: number;
  name: string;
  content: string;
}

export class Notes {
  public notesList = reactive([] as Note[]);

  constructor(
    private readonly socket: Socket,
    private readonly roomId: number,
    private readonly categoryId: number,
  ) {
    this.loadNotes(roomId, categoryId);

    socket.on('note-added', (note: Note) => {
      this.notesList.push(note);
    });

    socket.on(
      'note-updated',
      ({ noteId, content }: { noteId: number; content: string }) => {
        const note = this.getNoteById(noteId);
        if (note) {
          note.content = content;
        }
      },
    );
  }

  async loadNotes(roomId: number, categoryId: number) {
    const api = useApi();
    const notesResult = await api.getNotes(roomId, categoryId);
    this.notesList.push(...notesResult);
  }

  public getNoteById(noteId: number) {
    return this.notesList.find((note) => note.id === noteId);
  }

  public addNote(name: string): Promise<number> {
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

  public updateNote(noteId: number, content: string) {
    this.socket.emit('update-note', { noteId, content });
  }
}
