import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { computed, reactive, UnwrapNestedRefs } from 'vue';
import { useRouter } from 'vue-router';
import { convertDates } from '@/composables/utils';
import { useAuth } from '@/composables/auth';
import { useStore } from '@/composables/store';
import Peer from 'peerjs';
import { Notes } from '@/composables/channel/notes';
import { Whiteboard } from '@/composables/channel/whiteboard';
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
 * It can use the functions of the channel.
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
  room: Room;
  browserPeerId: string;
  teacher: Teacher;
  students: Student[];
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
}

/**
 * The channel store that is used to represent the channel.
 */
export const useChannel = defineStore('channel', () => {
  const router = useRouter();
  const auth = useAuth();
  const browser = useBrowser();

  /**
   * The channel state object that is used to represent the state of the channel.
   * @property connected - Whether the channel is connected or not
   * @property channelId - The id of the channel
   * @property clientId - The id of the client that is connected to the channel
   * @property room - The room object of the room that is connected to the channel
   * @property teacher - The teacher object of the teacher that is connected to the channel
   * @property students - The students that are connected to the channel
   *
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

  let webcamsLoaded = false;
  const streams: Record<string, MediaStream> = reactive({});

  let socket: Socket | null = null;

  /**
   * Establishes a socket connection with the server.
   * This function checks if the client is already connected (`state.connected`).
   * If not connected, it creates a new socket connection using the socket.io library.
   * Once the connection is established, the function sets up event listeners using `handleConnection`,
   * and returns a promise that resolves when the connection is established.
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
   * Loads webcams and initiates video calls between the current user and other users.
   * The function is only called once, as `webcamsLoaded` is set once the webcams are loaded.
   * In development environments, audio stream is deactivated to avoid disturbances.
   * The function uses WebRTC and Peer.js to enable video calls.
   * @returns  A Promise that resolves successfully once webcams are loaded.
   */
  async function loadWebcams(): Promise<void> {
    if (webcamsLoaded) {
      return;
    }

    const user = currentUser();

    if (import.meta.env.DEV) {
      // deactivate audio in dev mode as it can get annoying
      user.audio = false;
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

    streams[state.clientId] = stream;
    webcamsLoaded = true;
  }

  /**
   * Gets the current state of a webcam stream from a user.
   * @param userId - The id of the user to get the webcam stream from
   * @returns The current state of a webcam stream from a user
   */
  function getWebcamStream(userId: string): MediaStream {
    return streams[userId] ?? null;
  }

  /**
   * Toggles the video state (enable/disable) of the current user's webcam.
   * This function updates the `video` property of the current user, enables/disables the video track in the user's stream accordingly,
   * and emits an 'update-webcam' event to the server with the updated video state.
   */
  function toggleVideo(): void {
    const user = currentUser();
    const stream = streams[user.id];

    user.video = !user.video;
    stream?.getVideoTracks().forEach((track) => (track.enabled = user.video));
    socket?.emit('update-webcam', { video: user.video, audio: user.audio });
  }

  /**
   * Toggles the audio state (enable/disable) of the current user's microphone.
   * This function updates the `audio` property of the current user, enables/disables the audio track in the user's stream accordingly,
   * and emits an 'update-webcam' event to the server with the updated audio state.
   */
  function toggleAudio(): void {
    const user = currentUser();
    const stream = streams[user.id];

    user.audio = !user.audio;
    stream?.getAudioTracks().forEach((track) => (track.enabled = user.audio));
    socket?.emit('update-webcam', { video: user.video, audio: user.audio });
  }

  /**
   * Toggles the hand signal state of the current user (up/down).
   * This function updates the `handSignal` property of the current student and emits an 'update-handSignal' event
   * to the server with the updated hand signal state.
   */
  function toggleHandSignal(): void {
    const student = currentUser() as Student;

    student.handSignal = !student.handSignal;
    socket?.emit('update-handSignal', { handSignal: student.handSignal });
  }

  /**
   * Toggles the permission state of a student (allow/disallow) to perform certain actions.
   * This function updates the `permission` property of the specified student and emits an 'update-permission' event to the server with the updated permission state.
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

  /**
   * Stops the webcam streaming of the current user and removes all other users' streams.
   * This function stops all tracks in the current user's stream, clears the `streams` data structure,
   * and sets `webcamsLoaded` to `false`.
   */
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

  /**
   * Retrieves a user (either teacher or student) by their ID.
   * This function searches for the user with the given ID in the `state.teacher` and `state.students` arrays.
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
   * This function searches for the student with the given ID in the `state.students` array.
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
   * This function determines whether the provided `user` is a student by comparing their ID with the ID of the teacher (if available).
   * @param  user - The user to check.
   * @returns true if the user is a student, false if not.
   */
  function isStudent(user: ChannelUser): user is Student {
    return user.id !== state.teacher?.id;
  }

  /**
   * Checks if the given user is a teacher.
   * This function determines whether the provided `user` is a teacher by comparing their ID with the ID of the teacher (if available).
   * @param {ChannelUser} user - The user to check.
   * @returns {boolean} `true` if the user is a teacher, `false` if not.
   */
  function isTeacher(user: ChannelUser): user is Teacher {
    return user.id === state.teacher?.id;
  }

  /**
   * Retrieves the current user based on the `state.clientId`.
   * This function uses the `userById` function to retrieve the current user based on the `state.clientId`.
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
   * This function filters the `state.students` array to exclude the current user (self).
   * If the teacher is present and is not the current user, it is also added to the resulting array.
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
   * This function establishes a connection to a room through the socket and initializes the state accordingly.
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

  /**
   * Joins the room as a teacher.
   * This async function establishes a connection to the server by calling the `connect` function.
   * It then joins the room as a teacher by calling the `join` function with specific parameters.
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
   * This async function establishes a connection to the server by calling the `connect` function.
   * It then joins the room as a student by calling the `join` function with specific parameters.
   * @param  id - The ID of the room to join.
   * @param password - The password to join the room (optional).
   * @returns  A promise that resolves when the student successfully joins the room.
   */
  async function joinAsStudent(id: string, password?: string): Promise<void> {
    await connect();
    return join(id, 'join-room-as-student', {
      channelId: id,
      name: 'Verbinden...',
      password,
    });
  }

  /**
   * Joins a specific room by emitting an event to the server.
   * This function sends a payload to the server with the specified event and resolves the promise when the joining process is completed successfully.
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

        browser.peerId.value = data.browserPeerId;

        resolve();
      });
    });
  }

  /**
   * Notifies the server that the teacher is leaving the current room.
   * This function emits the 'leave-room' event to the server to indicate that the teacher is leaving the room.
   */
  function leaveAsTeacher() {
    socket?.emit('leave-room');
  }

  /**
   * Changes the name of the current user and notifies the server.
   * This function sets the new name in the local storage and emits the 'change-name' event to the server.
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
   * This function checks if the client is currently connected to a room.
   * If connected, it closes the socket connection, sets the socket variable to null, and updates the application state accordingly.
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
   * Checks if the given `ChannelUser` object or user ID is representing the current client (self).
   * This function checks if the user ID of the given `ChannelUser` object or the provided user ID is equal to the client's ID (`state.clientId`).
   * If they are equal, it means the user is the current client (self), and the function returns `true`; otherwise, it returns `false`.
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
   * This function is called when the socket connection is established, and it listens for different events emitted by the server.
   * The function updates the application state and performs other actions based on the received events.
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
    streams,
    loadWebcams,
    loadNotes,
    getWebcamStream,
    toggleVideo,
    toggleAudio,
    toggleHandSignal,
    updatePermission,
    stopWebcam,
    scroll,
  };
});
