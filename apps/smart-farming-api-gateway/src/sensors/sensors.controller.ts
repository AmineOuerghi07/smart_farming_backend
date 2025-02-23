import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from '@app/contracts/sensor/dtos/sensor-dto/create-sensor.dto';
import { UpdateSensorDto } from '@app/contracts/sensor/dtos/sensor-dto/update-sensor.dto';
import { UpdateRegionDto } from '@app/contracts/sensor/dtos/region-dto/update-region.dto';
import { CreateRegionDto } from '@app/contracts/sensor/dtos/region-dto/create-region.dto';


@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

 @Post('/sensor')
    async createSensor(@Body()createSensorDto : CreateSensorDto){
          return this.sensorsService.createSensor(createSensorDto)
    }
    @Get('/sensor')
    async findAllSensor(){
      return this.sensorsService.findAllSensor()
    }
    @Get('/sensor/:id')
   async findOneSensor(@Param('id')id :string){
          return this.sensorsService.findOneSensor(id)
    }
    @Put('/sensor/:id')
   async updateSensor(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto)
    {
      return this.sensorsService.updateSensor(id , updateSensorDto)
    }
    @Delete('/sensor/:id')
   async deleteSensor(@Param('id') id: string)
    {
      return this.sensorsService.removeSensor(id)
    }
  //--------------------Region EndPoint Testing------------------------------------------

    @Post('/region')
    async createRegion(@Body()createRegionDto : CreateRegionDto){
          return this.sensorsService.createRegion(createRegionDto)
    }
    @Get('/region')
    async findAllRegion(){
      return this.sensorsService.findAllRegion()
    }
    @Get('/region/:id')
   async findOneRegion(@Param('id')id :string){
          return this.sensorsService.findOneRegion(id)
    }
    @Put('/region/:id')
   async updateRegion(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto)
    {
      return this.sensorsService.updateRegion(id , updateRegionDto)
    }
    @Delete('/region/:id')
   async deleteRegion(@Param('id') id: string)
    {
      return this.sensorsService.removeRegion(id)
    }
}
