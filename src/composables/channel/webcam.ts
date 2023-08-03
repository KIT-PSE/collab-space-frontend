import Peer from 'peerjs';
import { reactive } from 'vue';
import { Socket } from 'socket.io-client';
import { ChannelUser } from '@/composables/channel/channel';

export class Webcam {
  public webcamsLoaded = false;
  public streams: Record<string, MediaStream> = reactive({});

  constructor(
    private readonly socket: Socket,
    private readonly user: ChannelUser,
    private readonly otherUsers: () => ChannelUser[],
  ) {
    this.loadWebcams();

    socket.on(
      'connect-webcam',
      ({ userId, peerId }: { userId: string; peerId: string }) => {
        const peer = new Peer();
        const stream = this.getWebcamStream(user.id);

        peer.on('open', () => {
          const call = peer.call(peerId, stream);
          call.on('stream', (remoteStream) => {
            this.streams[userId] = remoteStream;
          });
        });
      },
    );
  }

  public async loadWebcams(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!this.user.video) {
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
    }

    if (!this.user.audio) {
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
    }

    for (const userToConnectTo of this.otherUsers()) {
      const peer = new Peer();

      peer.on('open', (id) => {
        this.socket.emit('connect-webcam', {
          userId: userToConnectTo.id,
          peerId: id,
        });
      });

      peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          this.streams[userToConnectTo.id] = remoteStream;
        });
      });
    }

    this.streams[this.user.id] = stream;
    this.webcamsLoaded = true;
  }

  public getWebcamStream(userId: string): MediaStream {
    return this.streams[userId] ?? null;
  }

  public toggleVideo(): void {
    const stream = this.streams[this.user.id];

    this.user.video = !this.user.video;
    stream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = this.user.video));
    this.socket.emit('update-webcam', {
      video: this.user.video,
      audio: this.user.audio,
    });
  }

  public toggleAudio(): void {
    const stream = this.streams[this.user.id];

    this.user.audio = !this.user.audio;
    stream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = this.user.audio));
    this.socket.emit('update-webcam', {
      video: this.user.video,
      audio: this.user.audio,
    });
  }

  public stopWebcam(): void {
    const stream = this.streams[this.user.id];

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    for (const id in this.streams) {
      delete this.streams[id];
    }

    this.webcamsLoaded = false;
  }
}
