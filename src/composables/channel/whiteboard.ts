import { Socket } from 'socket.io-client';
import { fabric } from 'fabric';

export class Whiteboard {
  constructor(private readonly socket: Socket) {}

  public async change(path: fabric.Path) {
    console.log(path);
    this.socket.emit('whiteboard-change', { path });
  }

  public onChanges(callback: (path: fabric.Path) => void) {
    this.socket.on('whiteboard-change', (payload: { path: fabric.Path }) => {
      callback(payload.path);
    });
  }
}
