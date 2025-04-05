import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SENSORS_NAME, SENSORS_QUEUE } from '@app/contracts/sensor/sensors.rmq';

@Module({
    imports: [
   
      ClientsModule.register([
            {
              name: SENSORS_NAME,
              transport: Transport.RMQ,
              options: {
                urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
                queue: SENSORS_QUEUE,
                queueOptions: {
                  durable: false
                },
              },
            },
          ]),
    ],
  controllers: [SensorsController],
  providers: [SensorsService],
})
export class SensorsModule {}
