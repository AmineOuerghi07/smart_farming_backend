import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BLOCKCHAIN_NAME, BLOCKCHAIN_QUEUE } from '@app/contracts/blockchain/blockchain.rmq';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BLOCKCHAIN_NAME,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: BLOCKCHAIN_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),

  ],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class BlockchainModule { }
