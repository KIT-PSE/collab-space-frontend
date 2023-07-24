import { Socket } from 'socket.io-client';

export class Whiteboard {
  constructor(private readonly socket: Socket, private initialCanvas: string) {}

  public async change(canvas: string) {
    this.socket.emit('whiteboard-change', { canvas });
  }

  public onChanges(callback: (canvas: string) => void) {
    callback(this.initialCanvas);

    this.socket.on('whiteboard-change', (payload: { canvas: string }) => {
      callback(payload.canvas);
    });
  }
}
