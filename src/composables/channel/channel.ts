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

/**
 * The channel user object that is used to represent a channel user.
 * A channel user is a user that is connected to a channel.
 * It can be a teacher or a student.
 *
 * @property id - The id of the user
 * @property video - Whether the user has video enabled
 * @property audio - Whether the user has audio enabled
 */
export interface ChannelUser {
  id: string;
  video: boolean;
  audio: boolean;
}

/**
 * The student object that is used to represent a student.
 * A student does not have to be a user that is registered in the system.
 * @property name - The name of the student
 * @property handSignal - Whether the student has his hand raised or not
 * @property permission - Whether the student has permission to do certain actions
 */
export interface Student extends ChannelUser {
  name: string;
  handSignal: boolean;
  permission: boolean;
}

/**
 * The teacher object that is used to represent a teacher.
 * A teacher has to be a user that is registered in the system.
 * @property user - The user object of the teacher
 */
export interface Teacher extends ChannelUser {
  user: User;
}

/**
 * The join room result object that is used to represent the result of joining a room.
 * @property room - The room object of the room that was joined
 * @property browserPeerId - The peer id of the browser
 * @property teacher - The teacher object of the teacher that is connected to the room
 * @property students - The list of students that are connected to the room
 */
export interface JoinRoomResult {
  room: Room & { channelId: string };
  browserPeerId: string;
  browserUrl: string;
  teacher: Teacher;
  students: Student[];
  settings: Settings;
}

/**
 * The channel state object that is used to represent the state of the channel.
 * @property connected - Whether the channel is connected or not
 * @property channelId - The id of the channel
 * @property clientId - The id of the client that is connected to the channel
 * @property room - The room object of the room that is connected to the channel
 * @property teacher - The teacher object of the teacher that is connected to the channel
 * @property students - The students that are connected to the channel
 * @property hasName -  If the channel has a name or not
 * @property notes - The notes that are connected to the channel
 * @property whiteboard - The whiteboard current state of the used whiteboard
 */
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
  settings: Settings;
}

/**
 * The settings object that is used to represent the settings of the channel.
 * @property globalMute - Whether all students are muted or not
 */
export interface Settings {
  globalMute: boolean;
}

/**
 * The channel store that is used to represent the channel.
 */
export const useChannel = defineStore('channel', () => {
  const router = useRouter();
  const auth = useAuth();
  const browser = useBrowser();
  const webcam = useWebcam();

  /**
   * The channel state object that is used to represent the state of the channel.
   */
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
    settings: {
      globalMute: false,
    },
  } as ChannelState);

  /**
   * If the current user has permission to do certain actions.
   * A teacher always has permission and students only have permission given by the teacher.
   * @returns Whether the current user has permission to do certain actions
   */
  const hasCurrentUserPermission = computed(() => {
    const user = currentUser();
    return isTeacher(user) || (user as Student).permission;
  });

  let socket: Socket | null = null;

  /**
   * Establishes a socket connection with the server.
   * @returns A promise that resolves when the socket connection is established.
   */
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

  /**
   * Loads the state of the created Notes within a channel.
   * @returns The notes that are connected to the channel
   */
  function loadNotes() {
    const notes = new Notes(socket!, state.room!.id, state.room!.category);
    state.notes = notes;

    return notes;
  }

  /**
   * Asynchronously loads the webcams for other users in the session.
   */
  async function loadWebcams() {
    await webcam.load(otherUsers);
  }

  /**
   * Toggles the hand signal state of the current user (up/down).
   */
  function toggleHandSignal(): void {
    const student = currentUser() as Student;

    student.handSignal = !student.handSignal;
    socket?.emit('update-handSignal', { handSignal: student.handSignal });
  }

  /**
   * Toggles the permission state of a student (allow/disallow) to perform certain actions.
   * @param studentId - The ID of the student whose permission state is to be updated.
   */
  function updatePermission(studentId: string): void {
    const student = studentById(studentId);

    student.permission = !student.permission;
    socket?.emit('update-permission', {
      studentId,
      permission: student.permission,
    });
  }

  function toggleGlobalMute(): void {
    socket?.emit('update-settings', {
      ...state.settings,
      globalMute: !state.settings.globalMute,
    });
  }

  /**
   * Retrieves a user (either teacher or student) by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user with the specified ID if found, or `undefined` if not found.
   */
  function userById(id: string): ChannelUser | undefined {
    if (state.teacher?.id === id) {
      return state.teacher;
    }

    return state.students.find((s) => s.id === id);
  }

  /**
   * Retrieves a student by their ID.
   * @param id - The ID of the student to retrieve.
   * @returns  The student with the specified ID.
   */
  function studentById(id: string): Student {
    const student = state.students.find((s) => s.id === id);
    if (!student) {
      throw new Error('IllegalState: User not found');
    }
    return student;
  }

  /**
   * Checks if the given user is a student.
   * @param  user - The user to check.
   * @returns true if the user is a student, false if not.
   */
  function isStudent(user: ChannelUser): user is Student {
    return user.id !== state.teacher?.id;
  }

  /**
   * Checks if the given user is a teacher.
   * @param {ChannelUser} user - The user to check.
   * @returns {boolean} `true` if the user is a teacher, `false` if not.
   */
  function isTeacher(user: ChannelUser): user is Teacher {
    return user.id === state.teacher?.id;
  }

  /**
   * Retrieves the current user based on the `state.clientId`.
   * @returns The current user (either teacher or student).
   * @throws  If the current user is not found.
   */
  function currentUser(): ChannelUser {
    const user = userById(state.clientId);

    if (!user) {
      throw new Error('IllegalState: User not found');
    }

    return user;
  }

  /**
   * Retrieves an array of other users in the channel (excluding the current user).
   * @returns An array of other users (students and teacher) in the channel.
   */
  function otherUsers(): ChannelUser[] {
    const users: ChannelUser[] = state.students.filter((s) => !isSelf(s));

    if (state.teacher && !isSelf(state.teacher)) {
      users.push(state.teacher);
    }

    return users;
  }

  /**
   * Opens a room for the specified user.
   * @param user - The user who wants to join the room.
   * @param room - The room the user wants to join.
   * @throws If the socket is not connected.
   * @returns A promise that resolves when the connection to the room is successfully established.
   */
  async function open(user: User, room: Room) {
    if (!socket) {
      throw new Error('Socket is not connected');
    }

    const payload = {
      userId: user.id,
      roomId: room.id,
    };

    socket?.emit('open-room', payload, async (result: JoinRoomResult) => {
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
      state.settings = result.settings;

      browser.peerId.value = '';
      browser.setUrl('www.google.com');

      await router.push({
        name: 'room',
        params: {
          id: result.room.channelId,
        },
      });

      room.channelId = result.room.channelId;
    });
  }

  /**
   * Joins the room as a teacher.
   * @param id - The ID of the room to join.
   * @param user - The user who wants to join the room as a teacher.
   * @returns A promise that resolves when the teacher successfully joins the room.
   */
  async function joinAsTeacher(id: string, user: User): Promise<void> {
    await connect();
    return join(id, 'join-room-as-teacher', {
      channelId: id,
      userId: user.id,
    });
  }

  /**
   * Joins the room as a student.
   * @param  id - The ID of the room to join.
   * @param password - The password to join the room (optional).
   * @returns  A promise that resolves when the student successfully joins the room.
   */
  async function joinAsStudent(id: string, password?: string): Promise<void> {
    await connect();
    await join(id, 'join-room-as-student', {
      channelId: id,
      name: 'Verbinden...',
      password,
    });

    if (state.settings.globalMute && currentUser().audio) {
      webcam.toggleAudio();
    }
  }

  /**
   * Joins a specific room by emitting an event to the server.
   * @param id - The ID of the room to join.
   * @param event - The name of the event to emit for joining the room.
   * @param payload - The payload to send along with the event.
   * @returns  A promise that resolves when the joining process is completed successfully.
   */
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
        state.settings = data.settings;

        browser.peerId.value = data.browserPeerId;
        browser.setUrl(data.browserUrl);

        resolve();
      });
    });
  }

  /**
   * Notifies the server that the teacher is leaving the current room.
   */
  function leaveAsTeacher() {
    socket?.emit('leave-room');
  }

  /**
   * Changes the name of the current user and notifies the server.
   * @param name - The new name to set for the current user.
   * @returns A promise that resolves when the name change is completed successfully.
   */
  function changeName(name: string): Promise<void> {
    localStorage.setItem(`session-name`, name);

    return new Promise((resolve) => {
      socket?.emit('change-name', { name }, () => {
        state.hasName = true;
        resolve();
      });
    });
  }

  /**
   * Disconnects from the current room and closes the socket connection.
   */
  function leave() {
    if (!state.connected) {
      return;
    }

    socket?.close();
    socket = null;
    state.connected = false;
  }

  /**
   * Closes the channel with the given id.
   * @param channelId The id of the channel to close.
   */
  function close(channelId: string) {
    socket?.emit('close-channel', { channelId });
  }

  /**
   * Checks if the given `ChannelUser` object or user ID is representing the current client (self).
   * @param user - The `ChannelUser` object or user ID to check.
   * @returns `true` if the user is the current client (self), `false` otherwise.
   */
  function isSelf(user: ChannelUser | string) {
    if (typeof user === 'string') {
      return user === state.clientId;
    }

    return user.id === state.clientId;
  }

  /**
   * Sets up event listeners on the socket connection to handle various events related to room connections and user interactions.
   * @param  socket - The socket connection to listen for events on.
   */
  function handleConnection(socket: Socket) {
    socket.on('disconnect', async () => {
      state.connected = false;
      state.channelId = '';
      state.room = null;
      state.students = [];
      state.teacher = null;
      state.hasName = false;
      state.settings = {
        globalMute: false,
      };

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
        alerts.info('Der Raum wurde geschlossen.');
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

    socket.on('disable-audio-for', (id: string) => {
      const student = studentById(id);

      if (student) {
        student.audio = false;
      }
    });

    socket.on('update-settings', (settings: Settings) => {
      const oldSettings = { ...state.settings };
      state.settings = settings;

      if (!oldSettings.globalMute && settings.globalMute) {
        state.students
          .filter((s) => s.audio)
          .forEach((s) => webcam.disableAudioFor(s));

        if (isStudent(currentUser())) {
          alerts.primary(
            'Stummschaltung',
            'Der Lehrer hat alle Mikrofone stummgeschaltet.',
          );
        } else {
          alerts.primary(
            'Stummschaltung',
            'Sie haben alle Mikrofone stummgeschaltet.',
          );
        }
      }

      if (oldSettings.globalMute && !settings.globalMute) {
        if (isStudent(currentUser())) {
          alerts.primary(
            'Stummschaltung',
            'Der Lehrer hat erlaubt alle Mikrofone wieder zu aktivieren.',
          );
        } else {
          alerts.primary(
            'Stummschaltung',
            'Sie haben erlaubt alle Mikrofone wieder zu aktivieren.',
          );
        }
      }
    });
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
    close,
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
    toggleGlobalMute,
  };
});
