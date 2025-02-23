import { NestFactory } from '@nestjs/core';
import { LandServiceModule } from './land-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LAND_QUEUE } from '@app/contracts/land/land.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LandServiceModule,
    {
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: LAND_QUEUE,
            queueOptions: {
              durable: false
            },
          },
    }

  );
  await app.listen();
}
bootstrap();
