import { ref, Ref } from 'vue';
import Peer from 'peerjs';
import { Socket } from 'socket.io-client';

export const useBrowser = () => {
  const browserStream: Ref<MediaStream | null> = ref(null);
  const peerId: Ref<string> = ref('');

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

  function init(newSocket: Socket) {
    socket = newSocket;

    socket.on('open-website', (newPeerId: string) => {
      console.log('connecting to peer', newPeerId);

      peerId.value = newPeerId;
      loadBrowserStream();
    });
  }

  function loadBrowserStream() {
    if (!peerId.value) {
      return false;
    }
    console.log('loading browser stream', peerId.value);
    browserPeer.connect(peerId.value);
    return true;
  }

  function openWebsite(url: string) {
    socket?.emit('open-website', { url });
  }

  function closeWebsite() {
    browserStream.value = null;
    socket?.emit('close-website');
  }

  function moveMouse(x: number, y: number) {
    socket?.emit('move-mouse', { x, y });
  }

  function mouseDown() {
    socket?.emit('mouse-down');
  }

  function mouseUp() {
    socket?.emit('mouse-up');
  }

  function keyDown(key: string) {
    socket?.emit('key-down', { key });
  }

  function keyUp(key: string) {
    socket?.emit('key-up', { key });
  }

  function scroll(deltaY: number) {
    socket?.emit('scroll', { deltaY });
  }

  function reload() {
    socket?.emit('reload');
  }

  function navigateBack() {
    socket?.emit('navigate-back');
  }

  function navigateForward() {
    socket?.emit('navigate-forward');
  }

  return {
    browserStream,
    browserPeer,
    peerId,
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
