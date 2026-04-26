import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ClassroomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-classroom')
  handleJoinClassroom(client: Socket, payload: { sessionId: string; userId: string }) {
    client.join(payload.sessionId);
    this.server.to(payload.sessionId).emit('student-joined', { userId: payload.userId });
  }

  @SubscribeMessage('update-state')
  handleUpdateState(client: Socket, payload: any) {
    this.server.to(payload.sessionId).emit('state-updated', payload);
  }
}
