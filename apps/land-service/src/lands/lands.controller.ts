import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { LAND_PATTERNS } from '@app/contracts/land/land.patterns';
import { ObjectId } from 'mongoose';

@Controller()
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @MessagePattern(LAND_PATTERNS.CREATE)
  create(@Payload() createLandDto: CreateLandDto) {
    return this.landsService.create(createLandDto);
  }

  @MessagePattern(LAND_PATTERNS.FIND_ALL)
  findAll() {
    return this.landsService.findAll();
  }

  @MessagePattern(LAND_PATTERNS.FIND_ONE)
  findOne(@Payload() id: ObjectId) {
    return this.landsService.findOne(id);
  }

  @MessagePattern(LAND_PATTERNS.UPDATE)
  update(@Payload() updateLandDto: UpdateLandDto) {
    return this.landsService.update(updateLandDto.id, updateLandDto);
  }

  @MessagePattern(LAND_PATTERNS.REMOVE)
  remove(@Payload() id: ObjectId) {
    return this.landsService.remove(id);
  }

  @MessagePattern(LAND_PATTERNS.FIND_LAND_PLANTS)
  getPlantsByLandId(@Payload() id: ObjectId) {
    return this.landsService.getPlantsByLandId(id);
  }
  @MessagePattern(LAND_PATTERNS.FIND_BY_USER_ID)
  async findLandsByUserId(userId: string) {
      return this.landsService.findLandsByUserId(userId);
  }
  @MessagePattern(LAND_PATTERNS.SET_LAND_FOR_RENT)
  async setLandForRent(@Payload() data: { landId: string; userId: string;rentPrice: number }) {
    return this.landsService.setLandForRent(data.landId, data.userId, data.rentPrice);
  }

  @MessagePattern(LAND_PATTERNS.FIND_LAND_FOR_RENT)
  async findLandForRent()  {
    return this.landsService.findLandsForRent();
  }
}
