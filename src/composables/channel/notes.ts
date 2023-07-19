import { Socket } from 'socket.io-client';
import { reactive } from 'vue';

export interface Note {
  id: number;
  name: string;
  content: string;
}

export class Notes {
  private notes = reactive([] as Note[]);

  constructor(private readonly socket: Socket) {
    this.socket.on('notes', (notes: Note[]) => {
      // TODO
    });

    this.notes.push({
      id: 1,
      name: 'Test Name sehr lang mal schauen wie es aussieht',
      content: 'Test Inhalt',
    });

    this.notes.push({
      id: 2,
      name: 'Test Name 2',
      content: 'Test Inhalt 2',
    });
  }

  public getNotes() {
    return this.notes;
  }

  public getNoteById(noteId: number) {
    return this.notes.find((note) => note.id === noteId);
  }

  public addNote(name: string): number {
    this.socket.emit('addNote', { name });

    return 0;
  }

  public updateNote(noteId: string, content: string) {
    //this.socket.emit('updateNote', { noteId, content });
  }
}
