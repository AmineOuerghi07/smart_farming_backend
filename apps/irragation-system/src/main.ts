import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { IrrigationSystemModule } from './irragation-system.module';
import { IRRIGATION_SYSTEM_QUEUE } from '@app/contracts/irrigation-system/irrigation-system.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(IrrigationSystemModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://smart_farming:password123@192.168.43.124:5672'],
      queue: IRRIGATION_SYSTEM_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.listen();
}

bootstrap();