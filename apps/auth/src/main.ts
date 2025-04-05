import { NestFactory } from '@nestjs/core';
import { AuthAppModule } from './auth-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_QUEUE } from '@app/contracts/auth/auth.rmq';
import { CustomRpcExceptionFilter } from '@app/contracts/errors/filters/rpc.exception.filter';



async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthAppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: AUTH_QUEUE,
        queueOptions: {
          durable: false,
        },
      }
    }
  );
  
  app.useGlobalFilters(new CustomRpcExceptionFilter());

  await app.listen();
}
bootstrap();
