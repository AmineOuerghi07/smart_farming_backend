import { NestFactory } from '@nestjs/core';
import { AuthAppModule } from './auth-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_QUEUE } from '@app/contracts/auth/auth.rmq';

const microservicesOptions: MicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: AUTH_QUEUE,
    queueOptions: {
      durable: false,
    },
  }
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthAppModule,
    microservicesOptions
  );
  app.listen();
}
bootstrap();
