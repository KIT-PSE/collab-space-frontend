import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '@/composables/api';
import { useAlerts } from '@/composables/alerts';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { convertDates } from '@/composables/utils';

const alerts = useAlerts();

export interface Student {
  id: string;
  name: string;
}

export interface JoinRoomResult {
  room: Room;
  teacher: User;
  students: Student[];
}

export const useChannel = defineStore('channel', () => {
  const router = useRouter();

  const connected = ref(false);
  const channelId = ref('');
  const room = ref<Room | null>(null);
  const teacher = ref<User | null>(null);
  const students = ref<Student[]>([]);

  let socket: Socket | null = null;

  async function open(user: User, roomToConnect: Room) {
    socket = io('http://localhost:3000');

    const payload = {
      userId: user.id,
      roomId: roomToConnect.id,
    };

    socket.on('connect', () => {
      socket?.emit('open-room', payload, (result: any) => {
        connected.value = true;
        channelId.value = result.id;
        room.value = roomToConnect;
        students.value = [];
        teacher.value = user;

        router.push({
          name: 'room',
          params: {
            id: result.id,
          },
        });
      });
    });

    handleConnection(socket);
  }

  async function joinAsTeacher(user: User, id: string): Promise<void> {
    return join(id, 'join-room-as-teacher', { userId: user.id, channelId: id });
  }

  async function joinAsStudent(name: string, id: string): Promise<void> {
    return join(id, 'join-room-as-student', { name, channelId: id });
  }

  function join(id: string, event: string, payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      socket = io('http://localhost:3000');

      socket.on('connect', () => {
        socket?.emit(event, payload, (result: any) => {
          if (result.error) {
            leave();
            reject(result.error);
          }

          const data = convertDates(result) as JoinRoomResult;

          connected.value = true;
          channelId.value = id;
          students.value = data.students;
          teacher.value = data.teacher;
          room.value = data.room;
          resolve();
        });
      });

      handleConnection(socket);
    });
  }

  function leave() {
    socket?.close();
  }

  function handleConnection(socket: Socket) {
    socket.on('disconnect', () => {
      connected.value = false;
      channelId.value = '';
      room.value = null;
      students.value = [];
      teacher.value = null;

      console.log('disconnected');
    });

    socket.on('exception', (exception: { message: string }) => {
      alerts.error(
        'Es ist ein Fehler aufgetreten.',
        new Error(exception.message),
      );
    });

    socket.on('student-joined', (student: Student) => {
      students.value.push(student);
    });

    socket.on('student-left', (id: string) => {
      const index = students.value.findIndex((s) => s.id === id);
      students.value.splice(index, 1);
    });

    socket.on('teacher-joined', (user: User) => {
      teacher.value = user;
    });

    socket.on('teacher-left', () => {
      teacher.value = null;
    });
  }

  return {
    connected,
    channelId,
    id: channelId,
    room,
    teacher,
    students,
    open,
    joinAsTeacher,
    joinAsStudent,
    leave,
  };
});
