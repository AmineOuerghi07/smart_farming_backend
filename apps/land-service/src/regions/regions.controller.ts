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
  @MessagePattern(REGION_PATTERNS.REGION_ADD_PLANT) // Define this in your REGION_PATTERNS
  addPlantToRegion(
    @Payload() data: { regionId: string; plantId: string; quantity: number; plantingDate?: Date },
  ) {
    return this.regionsService.addPlantToRegion(
      data.regionId,
      data.plantId,
      data.quantity,
      data.plantingDate
    );
  }

  @MessagePattern(REGION_PATTERNS.REGION_ADD_SENSOR)
addSensorToRegion(
  @Payload() data: { 
    regionId: string;
    sensorId: string;
    sensorName: string;
    value: number;
    threshold: number;
  }
) {
  return this.regionsService.addSensorToRegion(
    data.regionId,
    data.sensorId,
    data.sensorName,
    data.value,
    data.threshold
  );
}
@MessagePattern(REGION_PATTERNS.FIND_BY_LAND_IDS)
  findByLandIds(@Payload() landIds: string[]) {
    return this.regionsService.findByLandIds(landIds);
  }
@MessagePattern(REGION_PATTERNS.FIND_CONNECTED_REGIONS)
  findConnectedRegions(@Payload() userId: string) {
    return this.regionsService.findConnectedRegions(userId);
  }
  @MessagePattern(REGION_PATTERNS.ADD_ACTIVITY)
  addActivity(@Payload() data: { regionId: string; description: string; date?: string }) {
    console.log('Handler ADD_ACTIVITY called with:', data);
    return this.regionsService.addActivity(data.regionId, data.description, data.date);
  }

  @MessagePattern(REGION_PATTERNS.SET_ACTIVITY_DONE)
  setActivityDone(@Payload() data: { regionId: string; activityId: string; done: boolean }) {
    return this.regionsService.setActivityDone(data.regionId, data.activityId, data.done);
  }

  @MessagePattern(REGION_PATTERNS.REMOVE_ACTIVITY)
  removeActivity(@Payload() data: { regionId: string; activityId: string }) {
    return this.regionsService.removeActivity(data.regionId, data.activityId);
  }
}
