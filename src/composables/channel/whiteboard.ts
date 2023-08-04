import { Socket } from 'socket.io-client';

/**
 * Represents a whiteboard that allows users to change and listen for updates to the canvas.
 */
export class Whiteboard {
  /**
   * Constructs a new Whiteboard instance.
   * @param socket - The socket connection used for communication with the server.
   * @param initialCanvas - The initial state of the canvas.
   */
  constructor(private readonly socket: Socket, private initialCanvas: string) {}

  /**
   * Sends a canvas change event to the server.
   * @param canvas - The updated state of the canvas.
   */
  public async change(canvas: string) {
    this.socket.emit('whiteboard-change', { canvas });
  }

  /**
   * Registers a callback to listen for changes to the canvas.
   * The initial state of the canvas is also provided to the callback upon registration.
   * @param callback - The callback function to handle canvas changes.
   */
  public onChanges(callback: (canvas: string) => void) {
    callback(this.initialCanvas);

    this.socket.on('whiteboard-change', (payload: { canvas: string }) => {
      callback(payload.canvas);
    });
  }
}
