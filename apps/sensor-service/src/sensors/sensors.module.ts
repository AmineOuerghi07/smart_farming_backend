import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sensor, SensorSchema } from './entities/sensor.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sensor.name, schema: SensorSchema }]),
    
  ],
  controllers: [SensorsController],
  providers: [SensorsService],
})
export class SensorsModule {}
