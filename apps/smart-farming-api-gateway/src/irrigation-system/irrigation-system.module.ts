import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IrrigationSystemService } from './irrigation-system.service';
import { IrrigationSystemController } from './irrigation-system.controller';
import { IRRIGATION_SYSTEM_NAME, IRRIGATION_SYSTEM_QUEUE } from '@app/contracts/irrigation-system/irrigation-system.rmq';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: IRRIGATION_SYSTEM_NAME,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://smart_farming:password123@192.168.43.124:5672'],
          queue: IRRIGATION_SYSTEM_QUEUE,
          queueOptions: { 
            durable: true 
          },
          exchange: 'irrigation',
          prefetchCount: 1,
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [IrrigationSystemController],
  providers: [IrrigationSystemService],
})
export class IrrigationSystemModule {}