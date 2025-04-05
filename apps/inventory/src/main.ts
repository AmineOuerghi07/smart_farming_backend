import { NestFactory } from '@nestjs/core';
import { InventoryAppModule } from './inventory-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INVENTORY_QUEUE } from '@app/contracts/inventory/inventory.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InventoryAppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: INVENTORY_QUEUE,
        queueOptions: {
          durable: false
        },
      },
    });
    await app.listen();
}
bootstrap();
