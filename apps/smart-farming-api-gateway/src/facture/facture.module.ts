import { Module } from '@nestjs/common';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FACTURE_NAME, FACTURE_QUEUE } from '@app/contracts/facture/facture.rmq';

@Module({
   imports: [
      ClientsModule.register([
        {
          name: FACTURE_NAME,
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: FACTURE_QUEUE,
            queueOptions: {
              durable: false
            },
          },
        },
      ]),
    ],
  controllers: [FactureController],
  providers: [FactureService],
})
export class FactureModule {}
