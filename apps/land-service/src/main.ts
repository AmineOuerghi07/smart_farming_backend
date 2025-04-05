import { NestFactory } from '@nestjs/core';
import { LandServiceModule } from './land-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LAND_QUEUE } from '@app/contracts/land/land.rmq';
import { CustomRpcExceptionFilter } from '@app/contracts/errors/filters/rpc.exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LandServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: LAND_QUEUE,
        queueOptions: {
          durable: false
        },
      },
    }

  );

  app.useGlobalFilters(new CustomRpcExceptionFilter());


  await app.listen();
}
bootstrap();
