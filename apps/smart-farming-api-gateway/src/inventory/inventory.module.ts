import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { INVENTORY_NAME, INVENTORY_QUEUE } from '@app/contracts/inventory/inventory.rmq';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
          {
            name: INVENTORY_NAME,
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: INVENTORY_QUEUE,
              queueOptions: {
                durable: false
              },
            },
          },
        ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
