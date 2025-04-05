// users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { ORDER_NAME, ORDER_QUEUE } from '@app/contracts/order/order.rmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisCache } from '../cache/redis.cache.module';
import { AUTH_NAME, AUTH_QUEUE } from '@app/contracts/auth/auth.rmq';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ClientsModule.registerAsync([
      {
        name: ORDER_NAME,
        useFactory: async () => (
          {

            transport: Transport.RMQ,
            options: {
              urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
              queue: ORDER_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
      {
        name: AUTH_NAME,
        useFactory: async () => (
          {

            transport: Transport.RMQ,
            options: {
              urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
              queue: AUTH_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
    ]),


    RedisCache

  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }