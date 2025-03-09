import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PLANT_PATTERNS } from '@app/contracts/land/plant.patterns';

@Controller()
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @MessagePattern(PLANT_PATTERNS.CREATE)
  create(@Payload() createPlantDto: CreatePlantDto) {
    return this.plantsService.create(createPlantDto);
  }

  @MessagePattern(PLANT_PATTERNS.FIND_ALL)
  findAll() {
    console.log('Received pattern:', PLANT_PATTERNS.FIND_ALL);
    return this.plantsService.findAll();
  }

  @MessagePattern(PLANT_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.plantsService.findOne(id);
  }

  @MessagePattern(PLANT_PATTERNS.UPDATE)
  update(@Payload() updatePlantDto: UpdatePlantDto) {
    return this.plantsService.update(updatePlantDto.id, updatePlantDto);
  }

  @MessagePattern(PLANT_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.plantsService.remove(id);
  }
}
