import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClassroomService } from './classroom.service';

interface SessionState {
  currentLesson?: string;
  teacherControls: {
    showSolution: boolean;
    allowSkipping: boolean;
  };
  students: Record<string, { role: string; name?: string; progress: number; active: boolean }>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ClassroomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private sessionStates = new Map<string, SessionState>();

  constructor(private classroomService: ClassroomService) {}

  handleConnection(client: Socket) {
    console.log(`Classroom client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Classroom client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-classroom')
  async handleJoinClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string; role?: string },
  ) {
    try {
      const code = payload.sessionId.toUpperCase();

      // Ensure attendee is registered in PostgreSQL database
      let attendeeUser: any = null;
      if (payload.role !== 'TEACHER') {
        const attendee = await this.classroomService.joinSession(code, payload.userId);
        attendeeUser = attendee?.user;
      }

      // Fetch the full real session from database
      const dbSession = await this.classroomService.getSession(code);

      client.join(code);

      // Initialize session state if needed
      if (!this.sessionStates.has(code)) {
        this.sessionStates.set(code, {
          teacherControls: {
            showSolution: false,
            allowSkipping: false,
          },
          students: {},
        });
      }

      const state = this.sessionStates.get(code)!;

      // Populate real students from DB
      dbSession.attendees.forEach((att) => {
        state.students[att.userId] = {
          role: 'STUDENT',
          name: att.name,
          progress: att.progress,
          active: att.active,
        };
      });

      if (payload.role === 'TEACHER') {
        state.students[payload.userId] = {
          role: 'TEACHER',
          name: dbSession.teacher.name || 'Teacher',
          progress: 100,
          active: true,
        };
      }

      this.server.to(code).emit('student-joined', {
        userId: payload.userId,
        name: attendeeUser?.name || 'Student',
        role: payload.role || 'STUDENT',
        attendees: dbSession.attendees,
      });

      client.emit('session-state', {
        ...state,
        dbSession,
      });
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'Failed to join classroom' });
    }
  }

  @SubscribeMessage('update-progress')
  async handleUpdateProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string; progress: number },
  ) {
    const code = payload.sessionId.toUpperCase();
    try {
      // Persist student progress directly to PostgreSQL
      await this.classroomService.updateProgress(code, payload.userId, payload.progress);

      const state = this.sessionStates.get(code);
      if (state && state.students[payload.userId]) {
        state.students[payload.userId].progress = payload.progress;
      }

      this.server.to(code).emit('student-progress', {
        userId: payload.userId,
        progress: payload.progress,
      });
    } catch (err) {
      console.error('Failed to update progress in database:', err);
    }
  }

  @SubscribeMessage('update-state')
  handleUpdateState(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; state: any },
  ) {
    const code = payload.sessionId.toUpperCase();
    const state = this.sessionStates.get(code);
    if (state) {
      Object.assign(state, payload.state);
      this.server.to(code).emit('state-updated', state);
    }
  }

  @SubscribeMessage('teacher-control')
  handleTeacherControl(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; control: string; value: any },
  ) {
    const code = payload.sessionId.toUpperCase();
    const state = this.sessionStates.get(code);
    if (state) {
      state.teacherControls[payload.control] = payload.value;
      this.server.to(code).emit('teacher-control-updated', {
        control: payload.control,
        value: payload.value,
      });
    }
  }

  @SubscribeMessage('leave-classroom')
  async handleLeaveClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string },
  ) {
    const code = payload.sessionId.toUpperCase();
    client.leave(code);

    await this.classroomService.leaveSession(code, payload.userId);

    const state = this.sessionStates.get(code);
    if (state && state.students[payload.userId]) {
      delete state.students[payload.userId];
      this.server.to(code).emit('student-left', { userId: payload.userId });
    }
  }
}
