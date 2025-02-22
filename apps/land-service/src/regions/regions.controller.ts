import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { REGION_PATTERNS } from '@app/contracts/land/region.patterns';
import { ObjectId } from 'mongoose';

@Controller()
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @MessagePattern(REGION_PATTERNS.CREATE)
  create(@Payload() createRegionDto: CreateRegionDto) {
    return this.regionsService.create(createRegionDto);
  }

  @MessagePattern(REGION_PATTERNS.FIND_ALL)
  findAll() {
    return this.regionsService.findAll();
  }

  @MessagePattern(REGION_PATTERNS.FIND_ONE)
  findOne(@Payload() id: ObjectId) {
    return this.regionsService.findOne(id);
  }

  @MessagePattern(REGION_PATTERNS.UPDATE)
  update(@Payload() updateRegionDto: UpdateRegionDto) {
    return this.regionsService.update(updateRegionDto.id, updateRegionDto);
  }

  @MessagePattern(REGION_PATTERNS.REMOVE)
  remove(@Payload() id: ObjectId) {
    return this.regionsService.remove(id);
  }
}
