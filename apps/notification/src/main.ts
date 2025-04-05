// apps/notification/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATION_QUEUE } from '@app/contracts/notification/notification.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: NOTIFICATION_QUEUE,
        queueOptions: {
          durable: false
        },
      },
    }
  );
  await app.listen();
  console.log('Notification microservice is listening');
}
bootstrap();