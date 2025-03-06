import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { Region, RegionSchema } from './entities/region.entity';
import { Land, LandSchema } from '../lands/entities/land.entity';
import { Sensor, SensorSchema } from '../sensors/entities/sensor.entity';
import { LandsModule } from '../lands/lands.module';
import { NotificationsModule } from 'apps/notification/src/notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Region.name, schema: RegionSchema },
      { name: Land.name, schema: LandSchema },
      { name: Sensor.name, schema: SensorSchema },
    ]),
    LandsModule,
    forwardRef(() => NotificationsModule),
    UsersModule // Add this
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}