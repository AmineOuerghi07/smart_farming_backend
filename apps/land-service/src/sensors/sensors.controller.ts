import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SENSOR_PATTERNS } from '@app/contracts/land/sensor.patterns';
import { ObjectId } from 'mongoose';

@Controller()
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @MessagePattern(SENSOR_PATTERNS.CREATE)
  create(@Payload() createSensorDto: CreateSensorDto) {
    return this.sensorsService.create(createSensorDto);
  }

  @MessagePattern(SENSOR_PATTERNS.FIND_ALL)
  findAll() {
    return this.sensorsService.findAll();
  }

  @MessagePattern(SENSOR_PATTERNS.FIND_ONE)
  findOne(@Payload() id: ObjectId) {
    return this.sensorsService.findOne(id);
  }

  @MessagePattern(SENSOR_PATTERNS.UPDATE)
  update(@Payload() updateSensorDto: UpdateSensorDto) {
    return this.sensorsService.update(updateSensorDto.id, updateSensorDto);
  }

  @MessagePattern(SENSOR_PATTERNS.REMOVE)
  remove(@Payload() id: ObjectId) {
    return this.sensorsService.remove(id);
  }
}
