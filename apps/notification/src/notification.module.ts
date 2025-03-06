import { Module } from '@nestjs/common';

import { NotificationsModule } from './notifications/notifications.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/land-service'),
    NotificationsModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'sensor_notifications',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
})
export class NotificationModule {}
