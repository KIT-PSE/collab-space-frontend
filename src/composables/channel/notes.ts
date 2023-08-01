import { Socket } from 'socket.io-client';
import { reactive } from 'vue';

export interface Note {
  id: string;
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
      id: '1',
      name: 'Test',
      content: 'Test',
    });
  }

  public getNotes() {
    return this.notes;
  }

  public addNote(name: string, content: string) {
    //this.socket.emit('addNote', { name, content });
  }

  public updateNote(noteId: string, content: string) {
    //this.socket.emit('updateNote', { noteId, content });
  }
}
