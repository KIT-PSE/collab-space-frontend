import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { convertDates } from '@/composables/utils';
import { useAuth } from '@/composables/auth';
import { useStore } from '@/composables/store';

const alerts = useAlerts();

export interface Student {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  user: User;
}

export interface JoinRoomResult {
  room: Room;
  teacher: Teacher;
  students: Student[];
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
  });

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
      state.teacher = { id: state.clientId, user };
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

  async function joinAsTeacher(user: User, id: string): Promise<void> {
    await connect();
    return join(id, 'join-room-as-teacher', { userId: user.id, channelId: id });
  }

  async function joinAsStudent(name: string, id: string): Promise<void> {
    name = 'Verbinden...';
    await connect();
    return join(id, 'join-room-as-student', { name, channelId: id });
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

  function isSelf(user: Teacher | Student) {
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
      console.log('test');
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
    });

    socket.on('change-name', ({ id, name }: { id: string; name: string }) => {
      const index = state.students.findIndex((s) => s.id === id);
      state.students[index].name = name;
    });
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
    changeName,
  };
});
