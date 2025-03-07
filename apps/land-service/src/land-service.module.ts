// land-service.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RegionsModule } from './regions/regions.module';
import { LandsModule } from './lands/lands.module';
import { SensorsModule } from './sensors/sensors.module';
import { NOTIFICATION_NAME, NOTIFICATION_QUEUE } from '@app/contracts/notification/notification.rmq';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/smart-farming'),
    ClientsModule.register([
      {
        name: NOTIFICATION_NAME,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: NOTIFICATION_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
    RegionsModule,
    LandsModule,
    SensorsModule,
  ],
})
export class LandServiceModule {}