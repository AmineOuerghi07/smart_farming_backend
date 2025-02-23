import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SENSORS_PATTERNS } from '@app/contracts/sensor/sensor.patterns';

@Controller()
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @MessagePattern(SENSORS_PATTERNS.CREATE)
  create(@Payload() createSensorDto: CreateSensorDto) {
    return this.sensorsService.create(createSensorDto);
  }

  @MessagePattern(SENSORS_PATTERNS.FIND_ALL)
  findAll() {
    return this.sensorsService.findAll();
  }

  @MessagePattern(SENSORS_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.sensorsService.findOne(id);
  }

  @MessagePattern(SENSORS_PATTERNS.UPDATE)
  update(@Payload() updateSensorDto: UpdateSensorDto) {
    return this.sensorsService.update(updateSensorDto.id, updateSensorDto);
  }

  @MessagePattern(SENSORS_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.sensorsService.remove(id);
  }
}
