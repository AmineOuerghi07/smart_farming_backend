import { LAND_NAME, LAND_QUEUE } from '@app/contracts/land/land.rmq';
import { Module } from '@nestjs/common';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { LandController } from './land.controller';
import { LandService } from './land.service';


@Module({
  imports: [
 
    ClientsModule.register([
          {
            name: LAND_NAME,
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: LAND_QUEUE,
              queueOptions: {
                durable: false
              },
            },
          },
        ]),
  ],
  controllers: [LandController],
  providers: [LandService],
})
export class LandModule {}
