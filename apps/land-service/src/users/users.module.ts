// users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { ORDER_NAME, ORDER_QUEUE } from '@app/contracts/order/order.rmq';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
                urls: ['amqp://localhost:5672'],
                queue: ORDER_QUEUE,
                queueOptions: {
                  durable: false,
                },
              },
            })
          },
          ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}