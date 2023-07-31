import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { convertDates } from '@/composables/utils';
import { useAuth } from '@/composables/auth';
import { useStore } from '@/composables/store';
import Peer from 'peerjs';
import { Notes } from '@/composables/channel/notes';
import { Whiteboard } from '@/composables/channel/whiteboard';

const alerts = useAlerts();

export interface ChannelUser {
  id: string;
  video: boolean;
  audio: boolean;
}

export interface Student extends ChannelUser {
  name: string;
  handSignal: boolean;
}

export interface Teacher extends ChannelUser {
  user: User;
}

export interface JoinRoomResult {
  room: Room;
  teacher: Teacher;
  students: Student[];
}

export interface ChannelState {
  connected: boolean;
  channelId: string;
  clientId: string;
  room: Room | null;
  teacher: Teacher | null;
  students: Student[];
  hasName: boolean;
  notes: Notes | null;
  whiteboard: Whiteboard | null;
}

export const useChannel = defineStore('channel', () => {
  const router = useRouter();
  const auth = useAuth();

  const state = reactive({
    connected: false,
    channelId: '',
    clientId: '',
    room: null as Room | null,
    teacher: null as Teacher | null,
    students: [] as Student[],
    hasName: false,
    notes: null,
    whiteboard: null,
  } as ChannelState);

  let webcamsLoaded = false;
  const streams: Record<string, MediaStream> = reactive({});

  let socket: Socket | null = null;

  async function connect(): Promise<void> {
    if (state.connected) {
      return;
    }

    return new Promise((resolve) => {
      socket = io(import.meta.env.VITE_BACKEND_URL);

      socket.on('connect', () => {
        state.connected = true;
        handleConnection(socket!);
        resolve();
      });
    });
  }

  function loadNotes() {
    if (state.notes) {
      return state.notes;
    }

    const notes = new Notes(socket!);
    state.notes = notes;

    return notes;
  }

  async function loadWhiteboard(): Promise<Whiteboard> {
    if (state.whiteboard) {
      return state.whiteboard as Whiteboard;
    }

    const whiteboard = new Whiteboard(socket!);

    return whiteboard;
  }

  async function loadWebcams(): Promise<void> {
    if (webcamsLoaded) {
      return;
    }

    const user = currentUser();
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

    streams[state.clientId] = stream;
    webcamsLoaded = true;
  }

  function getWebcamStream(userId: string): MediaStream {
    return streams[userId] ?? null;
  }

  function toggleVideo(): void {
    const user = currentUser();
    const stream = streams[user.id];

    user.video = !user.video;
    stream?.getVideoTracks().forEach((track) => (track.enabled = user.video));
    socket?.emit('update-webcam', { video: user.video, audio: user.audio });
  }

  function toggleAudio(): void {
    const user = currentUser();
    const stream = streams[user.id];

    user.audio = !user.audio;
    stream?.getAudioTracks().forEach((track) => (track.enabled = user.audio));
    socket?.emit('update-webcam', { video: user.video, audio: user.audio });
  }

  function toggleHandSignal(): void {
    const student = currentUser() as Student;

    student.handSignal = !student.handSignal;
    socket?.emit('update-handSignal', { handSignal: student.handSignal });
  }

  function stopWebcam(): void {
    const stream = streams[state.clientId];

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    for (const id in streams) {
      delete streams[id];
    }

    webcamsLoaded = false;
  }

  function userById(id: string): ChannelUser | undefined {
    if (state.teacher?.id === id) {
      return state.teacher;
    }

    return state.students.find((s) => s.id === id);
  }

  function isStudent(user: ChannelUser): user is Student {
    return user.id !== state.teacher?.id;
  }

  function currentUser(): ChannelUser {
    const user = userById(state.clientId);

    if (!user) {
      throw new Error('IllegalState: User not found');
    }

    return user;
  }

  function otherUsers(): ChannelUser[] {
    const users: ChannelUser[] = state.students.filter((s) => !isSelf(s));

    if (state.teacher && !isSelf(state.teacher)) {
      users.push(state.teacher);
    }

    return users;
  }

  async function open(user: User, room: Room) {
    if (!socket) {
      throw new Error('Socket is not connected');
    }

    const payload = {
      userId: user.id,
      roomId: room.id,
    };

    socket?.emit('open-room', payload, async (result: any) => {
      state.connected = true;
      state.channelId = result.id;
      state.clientId = socket?.id || '';
      state.room = room;
      state.students = [];
      state.teacher = {
        id: state.clientId,
        user,
        video: true,
        audio: true,
      };
      state.hasName = true;

      await router.push({
        name: 'room',
        params: {
          id: result.id,
        },
      });

      room.channelId = result.id;
    });
  }

  async function joinAsTeacher(id: string, user: User): Promise<void> {
    await connect();
    return join(id, 'join-room-as-teacher', {
      channelId: id,
      userId: user.id,
    });
  }

  async function joinAsStudent(id: string): Promise<void> {
    await connect();
    return join(id, 'join-room-as-student', {
      channelId: id,
      name: 'Verbinden...',
    });
  }

  function join(id: string, event: string, payload: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      socket?.emit(event, payload, (result: any) => {
        if (result.error) {
          leave();
          reject(result.error);
        }

        const data = convertDates(result) as JoinRoomResult;

        state.connected = true;
        state.channelId = id;
        state.clientId = socket?.id || '';
        state.students = data.students;
        state.teacher = data.teacher;
        state.room = data.room;
        state.hasName = false;
        resolve();
      });
    });
  }

  function leaveAsTeacher() {
    socket?.emit('leave-room');
  }

  function changeName(name: string): Promise<void> {
    localStorage.setItem(`session-name`, name);

    return new Promise((resolve) => {
      socket?.emit('change-name', { name }, () => {
        state.hasName = true;
        resolve();
      });
    });
  }

  function leave() {
    socket?.close();
    socket = null;
  }

  function isSelf(user: ChannelUser | string) {
    if (typeof user === 'string') {
      return user === state.clientId;
    }

    return user.id === state.clientId;
  }

  function handleConnection(socket: Socket) {
    socket.on('disconnect', async () => {
      state.connected = false;
      state.channelId = '';
      state.room = null;
      state.students = [];
      state.teacher = null;
      state.hasName = false;

      if (router.currentRoute.value.name === 'room') {
        if (auth.isLoggedIn) {
          await router.push({ name: 'dashboard' });
        } else {
          await router.push({ name: 'home' });
        }
      }
    });

    socket.on('exception', (exception: { message: string }) => {
      alerts.error(
        'Es ist ein Fehler aufgetreten.',
        new Error(exception.message),
      );
    });

    socket.on('student-joined', (student: Student) => {
      state.students.push(student);
    });

    socket.on('student-left', (id: string) => {
      const index = state.students.findIndex((s) => s.id === id);
      state.students.splice(index, 1);
    });

    socket.on('teacher-joined', (user: Teacher) => {
      state.teacher = user;
    });

    socket.on('teacher-left', () => {
      state.teacher = null;
    });

    socket.on('room-closed', (id: number) => {
      const room = useStore().findRoom(id);

      if (room) {
        room.channelId = '';
      }

      if (state.room && state.room.id == id) {
        if (state.teacher && state.teacher.id == state.clientId) {
          router.push({ name: 'dashboard' });
        } else {
          router.push({ path: '/' });
        }
      }
    });

    socket.on('change-name', ({ id, name }: { id: string; name: string }) => {
      const index = state.students.findIndex((s) => s.id === id);
      state.students[index].name = name;
    });

    socket.on(
      'connect-webcam',
      ({ userId, peerId }: { userId: string; peerId: string }) => {
        const peer = new Peer();
        const stream = getWebcamStream(state.clientId);

        peer.on('open', () => {
          const call = peer.call(peerId, stream);
          call.on('stream', (remoteStream) => {
            streams[userId] = remoteStream;
          });
        });
      },
    );

    socket.on(
      'update-webcam',
      (payload: { id: string; video: boolean; audio: boolean }) => {
        const user = userById(payload.id);

        if (user) {
          user.video = payload.video;
          user.audio = payload.audio;
        }
      },
    );

    socket.on(
      'update-handSignal',
      (payload: { id: string; handSignal: boolean }) => {
        const student = userById(payload.id) as Student;

        if (student) {
          student.handSignal = payload.handSignal;
        }
      },
    );
  }

  return {
    state,
    connect,
    open,
    joinAsTeacher,
    joinAsStudent,
    leaveAsTeacher,
    leave,
    isSelf,
    isStudent,
    userById,
    currentUser,
    changeName,
    streams,
    loadWebcams,
    loadNotes,
    loadWhiteboard,
    getWebcamStream,
    toggleVideo,
    toggleAudio,
    toggleHandSignal,
    stopWebcam,
  };
});
