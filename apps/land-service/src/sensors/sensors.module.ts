import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { Sensor, SensorSchema } from './entities/sensor.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sensor.name, schema: SensorSchema }])],
  controllers: [SensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}