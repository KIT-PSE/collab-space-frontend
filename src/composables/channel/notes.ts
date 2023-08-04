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

  async load(roomId: number, categoryId: number) {
    const api = useApi();
    const notesResult = await api.getNotes(roomId, categoryId);
    this.notesList.push(...notesResult);
  }

  public getNote(noteId: number) {
    return this.notesList.find((note) => note.id === noteId);
  }

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

  public update(noteId: number, content: string) {
    this.socket.emit('update-note', { noteId, content });
  }

  public delete(noteId: number) {
    this.socket.emit('delete-note', { noteId });
  }

  public download(noteId: number) {
    const note = this.getNote(noteId);
    if (note) {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(note.content),
      );
      element.setAttribute('download', note.name);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }
}
