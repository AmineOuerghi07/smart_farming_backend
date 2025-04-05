import { NestFactory } from '@nestjs/core';
import { OrderAppModule } from './order-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ORDER_QUEUE } from '@app/contracts/order/order.rmq';
import { CustomRpcExceptionFilter } from '@app/contracts/errors/filters/rpc.exception.filter';

async function bootstrap() {
 
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderAppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: ORDER_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  });

    app.useGlobalFilters(new CustomRpcExceptionFilter());
  
  await app.listen();
}
bootstrap();
