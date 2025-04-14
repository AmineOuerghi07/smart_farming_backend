import { NestFactory } from '@nestjs/core';
import { ProductAppModule } from './product-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PRODUCT_QUEUE } from '@app/contracts/product/product.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductAppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: PRODUCT_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  });  
  await app.listen();
}
bootstrap();
