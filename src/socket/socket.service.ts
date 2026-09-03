import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export const USER_ROOM_PREFIX = 'user:';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(user_id: string, event: string, payload: unknown) {

    console.log("user rom prefix, userid", USER_ROOM_PREFIX, user_id, event, payload)
    if (!this.server || !user_id) return;
    this.server.to(`${USER_ROOM_PREFIX}${user_id}`).emit(event, payload);
    this.logger.debug(`Emitted "${event}" to user ${user_id}`);
  }
}
