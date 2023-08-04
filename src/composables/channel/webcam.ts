import Peer from 'peerjs';
import { reactive } from 'vue';
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

  /**
   * Loads webcams and initiates video calls between the current user and other users.
   * In development environments, audio stream is deactivated to avoid disturbances.
   * The function uses WebRTC and Peer.js to enable video calls.
   * @returns  A Promise that resolves successfully once webcams are loaded.
   */
  async function load(otherUsers: () => ChannelUser[]): Promise<void> {
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
        socket?.emit('connect-webcam', {
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
        const stream = getStream(user!.id);

        peer.on('open', () => {
          const call = peer.call(peerId, stream);
          call.on('stream', (remoteStream) => {
            streams[userId] = remoteStream;
          });
        });
      },
    );

    streams[user!.id] = stream;
    webcamsLoaded = true;
  }

  /**
   * Gets the current state of a webcam stream from a user.
   * @param userId - The id of the user to get the webcam stream from
   * @returns The current state of a webcam stream from a user
   */
  function getStream(userId: string): MediaStream {
    return streams[userId] ?? null;
  }

  /**
   * Toggles the video state (enable/disable) of the current user's webcam.
   * This function updates the `video` property of the current user, enables/disables the video track in the user's stream accordingly,
   * and emits an 'update-webcam' event to the server with the updated video state.
   */
  function toggleVideo(): void {
    const stream = streams[user!.id];

    user!.video = !user!.video;
    stream?.getVideoTracks().forEach((track) => (track.enabled = user!.video));
    socket?.emit('update-webcam', {
      video: user!.video,
      audio: user!.audio,
    });
  }

  /**
   * Toggles the audio state (enable/disable) of the current user's microphone.
   * This function updates the `audio` property of the current user, enables/disables the audio track in the user's stream accordingly,
   * and emits an 'update-webcam' event to the server with the updated audio state.
   */
  function toggleAudio(): void {
    const stream = streams[user!.id];

    user!.audio = !user!.audio;
    stream?.getAudioTracks().forEach((track) => (track.enabled = user!.audio));
    socket?.emit('update-webcam', {
      video: user!.video,
      audio: user!.audio,
    });
  }

  /**
   * Stops the webcam streaming of the current user and removes all other users' streams.
   */
  function stop(): void {
    const stream = streams[user!.id];

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
    load,
    getStream,
    toggleVideo,
    toggleAudio,
    stop,
  };
};
