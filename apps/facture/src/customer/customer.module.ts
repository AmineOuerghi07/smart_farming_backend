import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schema/customerSchema';
import { CustomerService } from './costumer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_NAME, ORDER_QUEUE } from '@app/contracts/order/order.rmq';
import { RedisCache } from '../cache/redis.cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema }
    ]),

    ClientsModule.registerAsync([
      {
        name: ORDER_NAME,
        useFactory: async () => (
          {

            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ ?? 'amqp://localhost:5672'],
              queue: ORDER_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
    ]),

    RedisCache
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule { }
