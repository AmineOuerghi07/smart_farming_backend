import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_NAME, ORDER_QUEUE } from '@app/contracts/order/order.rmq';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_NAME,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: ORDER_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
