import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

interface SocketData {
  user_id: string;
}

interface HandshakeAuth {
  token?: string;
}

import { SocketService, USER_ROOM_PREFIX } from './socket.service';

/**
 * Socket.IO Gateway
 * ---------------------------------------------------
 * Single namespace. Every authenticated socket joins
 * a personal room `user:{user_id}` so services can
 * push real-time events (e.g. meeting notifications)
 * to a specific user.
 *
 * Auth: client must pass JWT in the handshake:
 *   io(SERVER_URL, { auth: { token: access_token } })
 */
@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly socketService: SocketService,
  ) {}

  afterInit() {
    this.socketService.setServer(this.server);
    this.logger.log('Socket.IO gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const auth = (client.handshake.auth ?? {}) as HandshakeAuth;
      const headerAuth = client.handshake.headers?.authorization;
      const token = auth.token ?? headerAuth?.replace('Bearer ', '') ?? '';

      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
      );

      void client.join(`${USER_ROOM_PREFIX}${payload.sub}`);
      (client.data as SocketData).user_id = payload.sub;
      console.log("user-room-prefix, payload.sub, clientid", USER_ROOM_PREFIX, payload.sub, client.id)

      this.logger.log(`Client ${client.id} joined room user:${payload.sub}`);



    } catch (error) {
      this.logger.warn(
        `Rejected unauthenticated socket ${client.id}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user_id = (client.data as SocketData | undefined)?.user_id;
    if (user_id) {
      this.logger.log(`Client ${client.id} (user:${user_id}) disconnected`);
    }
  }

  /**
   * Lightweight health check from clients
   * socket.emit('ping', (serverTime) => { ... })
   */
  @SubscribeMessage('ping')
  handlePing() {
    return Date.now();
  }
}
