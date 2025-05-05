// lands.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { Land, LandSchema } from './entities/land.entity';
import { LandRequest, LandRequestSchema } from './entities/requests.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BLOCKCHAIN_NAME, BLOCKCHAIN_QUEUE } from '@app/contracts/blockchain/blockchain.rmq';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }, {name: LandRequest.name, schema: LandRequestSchema}]),
    ClientsModule.registerAsync([
      {
        name: BLOCKCHAIN_NAME,
        useFactory: async () => (
          {

            transport: Transport.RMQ,
            options: {
              urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
              queue: BLOCKCHAIN_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
    ]),
  ],
  controllers: [LandsController],
  providers: [LandsService],
  exports: [MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }]), LandsService],
})
export class LandsModule {}