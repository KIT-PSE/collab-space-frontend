import { ref, Ref } from 'vue';
import Peer from 'peerjs';
import { Socket } from 'socket.io-client';

/**
 * Composable that contains all the functions and variables related to the integrated Browser.
 * @returns - All the functions and variables related to the integrated Browser.
 */
export const useBrowser = () => {
  const browserStream: Ref<MediaStream | null> = ref(null);
  const peerId: Ref<string> = ref('');
  const url = ref('https://www.google.com');

  let socket: Socket | null = null;

  const browserPeer: Peer = new Peer();

  browserPeer.on('call', (call) => {
    console.log('calling');
    call.answer();

    call.on('stream', (stream) => {
      console.log('streaming');
      browserStream.value = stream;
    });
  });

  /**
   * Initializes the a new socket connection that Browser can use
   * @param newSocket - The new socket connection
   */
  function init(newSocket: Socket) {
    socket = newSocket;

    socket.on('open-website', (newPeerId: string) => {
      console.log('connecting to peer', newPeerId);

      peerId.value = newPeerId;
      loadBrowserStream();
    });

    socket.on('browser-url', (newUrl: string) => {
      url.value = newUrl;
    });
  }

  /**
   * Loads the browser stream from the peer id  if it exists
   * @returns - Whether the browser stream was loaded
   */
  function loadBrowserStream() {
    if (!peerId.value) {
      return false;
    }
    console.trace('loading browser stream', peerId.value);
    browserPeer.connect(peerId.value);
    return true;
  }

  /**
   * Opens a website on the browser
   * @param url - The url of the website to open
   */
  function openWebsite(url: string) {
    socket?.emit('open-website', { url });
  }

  /**
   * Closes the website on the browser
   */
  function closeWebsite() {
    browserStream.value = null;
    socket?.emit('close-website');
  }

  /**
   * Moves the mouse cursor to the specified coordinates in the integrated Browser.
   * @param x - The x coordinate of the mouse cursor
   * @param y  - The y coordinate of the mouse cursor
   */
  function moveMouse(x: number, y: number) {
    socket?.emit('move-mouse', { x, y });
  }

  /**
   * Sends a mouse down event to the integrated Browser.
   */
  function mouseDown() {
    socket?.emit('mouse-down');
  }

  /**
   * Sends a mouse up event to the integrated Browser.
   */
  function mouseUp() {
    socket?.emit('mouse-up');
  }

  /**
   * Sends a key down event to the integrated Browser.
   * @param key - The string representation of the key that was pressed
   */
  function keyDown(key: string) {
    socket?.emit('key-down', { key });
  }

  /**
   * Sends a key up event to the integrated Browser.
   * @param key - The string representation of the key that was released
   */
  function keyUp(key: string) {
    socket?.emit('key-up', { key });
  }

  /**
   * Scrolls the integrated Browser by the specified amount.
   * @param deltaY - The difference in the y coordinate to scroll by
   */
  function scroll(deltaY: number) {
    socket?.emit('scroll', { deltaY });
  }

  /**
   * Reloads the integrated Browser.
   */
  function reload() {
    socket?.emit('reload');
  }

  /**
   * Navigates one page back in the integrated Browser.
   */
  function navigateBack() {
    socket?.emit('navigate-back');
  }

  /**
   * Navigates one page forward in the integrated Browser.
   */
  function navigateForward() {
    socket?.emit('navigate-forward');
  }

  return {
    browserStream,
    browserPeer,
    peerId,
    url,
    init,
    loadBrowserStream,
    openWebsite,
    closeWebsite,
    moveMouse,
    mouseDown,
    mouseUp,
    keyDown,
    keyUp,
    scroll,
    reload,
    navigateBack,
    navigateForward,
  };
};
