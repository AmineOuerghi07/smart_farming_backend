// apps/notification/src/notifications/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendUserNotification(userId: string, message: string) {
    console.log(`Sending to ${userId}: ${message}`);
    this.server.to(userId).emit('sensorAlert', { userId, message, timestamp: new Date() });
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(client: Socket, userId: string) {
    client.join(userId);
    client.emit('joinedRoom', { userId, message: 'Joined user room successfully' });
  }
}