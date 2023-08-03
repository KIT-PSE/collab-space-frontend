import Peer from 'peerjs';
import { reactive, ref } from 'vue';
import { Socket } from 'socket.io-client';
import { ChannelUser } from '@/composables/channel/channel';

export const useWebcam = () => {
  let webcamsLoaded = false;
  const streams: Record<string, MediaStream> = reactive({});

  let user: ChannelUser | null = null;
  let socket: Socket | null = null;

  function init(newSocket: Socket): void {
    socket = newSocket;
    user = {
      id: socket.id,
      video: true,
      audio: true,
    };
  }

  async function loadWebcams(otherUsers: () => ChannelUser[]): Promise<void> {
    if (webcamsLoaded) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!user?.video) {
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
    }

    if (!user?.audio) {
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
    }

    for (const userToConnectTo of otherUsers()) {
      const peer = new Peer();

      peer.on('open', (id) => {
        socket.emit('connect-webcam', {
          userId: userToConnectTo.id,
          peerId: id,
        });
      });

      peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          streams[userToConnectTo.id] = remoteStream;
        });
      });
    }

    socket?.on(
      'connect-webcam',
      ({ userId, peerId }: { userId: string; peerId: string }) => {
        const peer = new Peer();
        const stream = getWebcamStream(user?.id);

        peer.on('open', () => {
          const call = peer.call(peerId, stream);
          call.on('stream', (remoteStream) => {
            streams[userId] = remoteStream;
          });
        });
      },
    );

    streams[user?.id] = stream;
    webcamsLoaded = true;
  }

  function getWebcamStream(userId: string): MediaStream {
    return streams[userId] ?? null;
  }

  function toggleVideo(): void {
    const stream = streams[user?.id];

    user!.video = !user!.video;
    stream?.getVideoTracks().forEach((track) => (track.enabled = user?.video));
    socket?.emit('update-webcam', {
      video: user?.video,
      audio: user?.audio,
    });
  }

  function toggleAudio(): void {
    const stream = streams[user?.id];

    user!.audio = !user!.audio;
    stream?.getAudioTracks().forEach((track) => (track.enabled = user?.audio));
    socket?.emit('update-webcam', {
      video: user?.video,
      audio: user?.audio,
    });
  }

  function stopWebcam(): void {
    const stream = streams[user?.id];

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    for (const id in streams) {
      delete streams[id];
    }

    webcamsLoaded = false;
  }

  return {
    streams,
    init,
    loadWebcams,
    getWebcamStream,
    toggleVideo,
    toggleAudio,
    stopWebcam,
  };
};
