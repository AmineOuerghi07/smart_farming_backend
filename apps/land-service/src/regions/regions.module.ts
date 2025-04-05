import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { Region, RegionSchema } from './entities/region.entity';
import { Land, LandSchema } from '../lands/entities/land.entity';
import { Sensor, SensorSchema } from '../sensors/entities/sensor.entity';
import { LandsModule } from '../lands/lands.module';
import { UsersModule } from '../users/users.module';
import { NOTIFICATION_NAME, NOTIFICATION_QUEUE } from '@app/contracts/notification/notification.rmq';
import { LandService } from 'apps/smart-farming-api-gateway/src/land/land.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Region.name, schema: RegionSchema },
      { name: Land.name, schema: LandSchema },
      { name: Sensor.name, schema: SensorSchema },
    ]),
    ClientsModule.register([
      {
        name: NOTIFICATION_NAME,
        transport: Transport.RMQ,
        options: {
          urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: NOTIFICATION_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
    LandsModule,
    UsersModule
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}