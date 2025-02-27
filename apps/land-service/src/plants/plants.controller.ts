import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller()
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @MessagePattern('createPlant')
  create(@Payload() createPlantDto: CreatePlantDto) {
    return this.plantsService.create(createPlantDto);
  }

  @MessagePattern('findAllPlants')
  findAll() {
    return this.plantsService.findAll();
  }

  @MessagePattern('findOnePlant')
  findOne(@Payload() id: number) {
    return this.plantsService.findOne(id);
  }

  @MessagePattern('updatePlant')
  update(@Payload() updatePlantDto: UpdatePlantDto) {
    return this.plantsService.update(updatePlantDto.id, updatePlantDto);
  }

  @MessagePattern('removePlant')
  remove(@Payload() id: number) {
    return this.plantsService.remove(id);
  }
}
