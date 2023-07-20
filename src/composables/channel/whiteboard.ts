import { Socket } from 'socket.io-client';
import { fabric } from 'fabric';
import { useApi } from '@/composables/api';

export class Whiteboard {
  constructor(
    private readonly socket: Socket,
    private readonly roomId: number,
    private readonly categoryId: number,
  ) {}

  public async loadCanvas() {
    const api = useApi();
    return (await api.getWhiteboardCanvas(this.roomId, this.categoryId))
      .whiteboard;
  }

  public async change(path: fabric.Path) {
    this.socket.emit('whiteboard-change', { path });
  }

  public onChanges(callback: (path: fabric.Path) => void) {
    this.socket.on('whiteboard-change', (payload: { path: fabric.Path }) => {
      callback(payload.path);
    });
  }
}
