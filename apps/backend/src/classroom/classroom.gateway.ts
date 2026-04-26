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
import { PrismaService } from '../prisma/prisma.service';

interface SessionState {
  currentLesson?: string;
  teacherControls: {
    showSolution: boolean;
    allowSkipping: boolean;
  };
  students: Map<string, any>;
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

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-classroom')
  async handleJoinClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string; role: string },
  ) {
    try {
      const session = await this.prisma.session.findUnique({
        where: { code: payload.sessionId },
        include: { attendees: true },
      });

      if (!session || !session.active) {
        client.emit('error', { message: 'Session not found or inactive' });
        return;
      }

      client.join(payload.sessionId);

      // Add attendee if not already present
      const existingAttendee = session.attendees.find((a) => a.userId === payload.userId);
      if (!existingAttendee) {
        await this.prisma.sessionAttendee.create({
          data: {
            sessionId: session.id,
            userId: payload.userId,
          },
        });
      }

      // Initialize session state if needed
      if (!this.sessionStates.has(payload.sessionId)) {
        this.sessionStates.set(payload.sessionId, {
          teacherControls: {
            showSolution: false,
            allowSkipping: false,
          },
          students: new Map(),
        });
      }

      const state = this.sessionStates.get(payload.sessionId);
      if (payload.role === 'TEACHER') {
        state.students.set(payload.userId, { role: 'TEACHER' });
      } else {
        state.students.set(payload.userId, { role: 'STUDENT', progress: 0 });
      }

      this.server.to(payload.sessionId).emit('student-joined', { userId: payload.userId, role: payload.role });
      client.emit('session-state', state);
    } catch (error) {
      client.emit('error', { message: 'Failed to join classroom' });
    }
  }

  @SubscribeMessage('update-state')
  handleUpdateState(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; state: any },
  ) {
    const state = this.sessionStates.get(payload.sessionId);
    if (state) {
      Object.assign(state, payload.state);
      this.server.to(payload.sessionId).emit('state-updated', state);
    }
  }

  @SubscribeMessage('update-progress')
  handleUpdateProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string; progress: number },
  ) {
    const state = this.sessionStates.get(payload.sessionId);
    if (state && state.students.has(payload.userId)) {
      const student = state.students.get(payload.userId);
      student.progress = payload.progress;
      this.server.to(payload.sessionId).emit('student-progress', { userId: payload.userId, progress: payload.progress });
    }
  }

  @SubscribeMessage('teacher-control')
  handleTeacherControl(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; control: string; value: any },
  ) {
    const state = this.sessionStates.get(payload.sessionId);
    if (state) {
      state.teacherControls[payload.control] = payload.value;
      this.server.to(payload.sessionId).emit('teacher-control-updated', { control: payload.control, value: payload.value });
    }
  }

  @SubscribeMessage('leave-classroom')
  handleLeaveClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; userId: string },
  ) {
    client.leave(payload.sessionId);
    const state = this.sessionStates.get(payload.sessionId);
    if (state) {
      state.students.delete(payload.userId);
      this.server.to(payload.sessionId).emit('student-left', { userId: payload.userId });
    }
  }
}
