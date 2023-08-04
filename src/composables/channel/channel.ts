import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { computed, reactive, UnwrapNestedRefs } from 'vue';
import { useRouter } from 'vue-router';
import { convertDates } from '@/composables/utils';
import { useAuth } from '@/composables/auth';
import { useStore } from '@/composables/store';
import { Notes } from '@/composables/channel/notes';
import { Whiteboard } from '@/composables/channel/whiteboard';
import { useWebcam } from '@/composables/channel/webcam';
import { useBrowser } from '@/composables/channel/browser';

const alerts = useAlerts();

export interface ChannelUser {
  id: string;
  video: boolean;
  audio: boolean;
}

export interface Student extends ChannelUser {
  name: string;
  handSignal: boolean;
  permission: boolean;
}

export interface Teacher extends ChannelUser {
  user: User;
}

export interface JoinRoomResult {
  room: Room;
  browserPeerId: string;
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
  const browser = useBrowser();
  const webcam = useWebcam();

  const state: UnwrapNestedRefs<ChannelState> = reactive({
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

  const hasCurrentUserPermission = computed(() => {
    const user = currentUser();
    return isTeacher(user) || (user as Student).permission;
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
        webcam.init(socket!);
        browser.init(socket!);

        handleConnection(socket!);
        resolve();
      });
    });
  }

  function loadNotes() {
    const notes = new Notes(socket!, state.room!.id, state.room!.category);
    state.notes = notes;

    return notes;
  }

  async function loadWebcams() {
    await webcam.load(otherUsers);
  }

  function toggleHandSignal(): void {
    const student = currentUser() as Student;

    student.handSignal = !student.handSignal;
    socket?.emit('update-handSignal', { handSignal: student.handSignal });
  }

  function updatePermission(studentId: string): void {
    const student = studentById(studentId);

    student.permission = !student.permission;
    socket?.emit('update-permission', {
      studentId,
      permission: student.permission,
    });
  }

  function userById(id: string): ChannelUser | undefined {
    if (state.teacher?.id === id) {
      return state.teacher;
    }

    return state.students.find((s) => s.id === id);
  }

  function studentById(id: string): Student {
    const student = state.students.find((s) => s.id === id);
    if (!student) {
      throw new Error('IllegalState: User not found');
    }
    return student;
  }

  function isStudent(user: ChannelUser): user is Student {
    return user.id !== state.teacher?.id;
  }

  function isTeacher(user: ChannelUser): user is Teacher {
    return user.id === state.teacher?.id;
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
      state.channelId = result.room.channelId;
      state.clientId = socket?.id || '';
      state.room = result.room;
      state.students = [];
      state.teacher = {
        id: state.clientId,
        user,
        video: true,
        audio: true,
      };
      state.hasName = true;
      state.whiteboard = new Whiteboard(socket!, result.room.whiteboardCanvas);

      browser.peerId.value = '';

      await router.push({
        name: 'room',
        params: {
          id: result.room.channelId,
        },
      });

      room.channelId = result.room.channelId;
    });
  }

  async function joinAsTeacher(id: string, user: User): Promise<void> {
    await connect();
    return join(id, 'join-room-as-teacher', {
      channelId: id,
      userId: user.id,
    });
  }

  async function joinAsStudent(id: string, password?: string): Promise<void> {
    await connect();
    return join(id, 'join-room-as-student', {
      channelId: id,
      name: 'Verbinden...',
      password,
    });
  }

  function join(id: string, event: string, payload: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      socket?.emit(event, payload, (result: any) => {
        if (result.error) {
          leave();
          return reject(result.error);
        }

        const data = convertDates(result) as JoinRoomResult;

        state.connected = true;
        state.channelId = id;
        state.clientId = socket?.id || '';
        state.students = data.students;
        state.teacher = data.teacher;
        state.room = data.room;
        state.hasName = false;
        state.whiteboard = new Whiteboard(socket!, data.room.whiteboardCanvas);

        browser.peerId.value = data.browserPeerId;

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
    if (!state.connected) {
      return;
    }

    socket?.close();
    socket = null;
    state.connected = false;
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
    });

    socket.on('change-name', ({ id, name }: { id: string; name: string }) => {
      const index = state.students.findIndex((s) => s.id === id);
      state.students[index].name = name;
    });

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

    socket.on(
      'update-permission',
      (payload: { id: string; permission: boolean }) => {
        const student = studentById(payload.id);

        if (student) {
          student.permission = payload.permission;
        }

        if (socket.id === payload.id) {
          alerts.add({
            type: 'info',
            title: 'Zugriffsänderung',
            message: payload.permission
              ? 'Sie haben jetzt Zugriff.'
              : 'Sie haben keinen Zugriff mehr.',
          });
        }
      },
    );
  }

  return {
    state,
    webcam,
    browser,
    connect,
    open,
    joinAsTeacher,
    joinAsStudent,
    leaveAsTeacher,
    leave,
    isSelf,
    isStudent,
    isTeacher,
    hasCurrentUserPermission,
    currentUser,
    changeName,
    loadWebcams,
    loadNotes,
    toggleHandSignal,
    updatePermission,
  };
});
