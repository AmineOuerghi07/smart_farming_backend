import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_NAME, AUTH_QUEUE } from '@app/contracts/auth/auth.rmq';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_NAME,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: AUTH_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
