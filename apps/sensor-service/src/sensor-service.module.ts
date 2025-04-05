import { Module } from '@nestjs/common';
import { RegionsModule } from './regions/regions.module';
import { SensorsModule } from './sensors/sensors.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
     MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://localhost:27017/sensor-service'),
     RegionsModule,
     SensorsModule],

})
export class SensorServiceModule {}
