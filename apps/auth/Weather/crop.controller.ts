import { Controller, Get, Query } from '@nestjs/common';
import { CropService } from './crop.service';

@Controller('crop')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Get()
  async getCropInfo(
    @Query('plant') plant: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
  ) {
    const start = startYear ? parseInt(startYear) : undefined;
    const end = endYear ? parseInt(endYear) : undefined;
    return this.cropService.getCropData(plant, start, end);
  }
}
