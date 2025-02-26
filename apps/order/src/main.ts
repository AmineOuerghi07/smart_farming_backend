import { NestFactory } from '@nestjs/core';
import { OrderAppModule } from './order-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ORDER_QUEUE } from '@app/contracts/order/order.rmq';

async function bootstrap() {
 
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderAppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: ORDER_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  });
  await app.listen();
}
bootstrap();
