import { Module } from '@nestjs/common';

import { CustumerController } from './custumer.controller';
import { CustomerService } from './custumer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from './schema/customerSchema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FACTURE_NAME, FACTURE_QUEUE } from '@app/contracts/facture/facture.rmq';
import { RedisCache } from '../cache/redis.cache.module';
import { LAND_NAME, LAND_QUEUE } from '@app/contracts/land/land.rmq';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
 ClientsModule.registerAsync([
      {
        name: FACTURE_NAME,
        useFactory: async () => (
        {
        
          transport: Transport.RMQ,
          options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: FACTURE_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      })
    },
    {
      name: LAND_NAME,
      useFactory: async () => (
      {
      
        transport: Transport.RMQ,
        options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: LAND_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    })
  },
    ]),

    RedisCache
  ],
  controllers: [CustumerController],
  providers: [CustomerService],
})
export class CustumerModule { }
