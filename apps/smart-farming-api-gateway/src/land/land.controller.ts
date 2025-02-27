import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { LandService } from './land.service';
import { CreateLandDto } from '@app/contracts/land/dtos/land-dto/create-land.dto';
import { UpdateLandDto } from '@app/contracts/land/dtos/land-dto/update-land.dto';
import { CreateUserDto } from '@app/contracts/land/dtos/user-dto/create-user.dto';

import { UpdateUserDto } from '@app/contracts/land/dtos/user-dto/update-user.dto';
import { CreateRegionDto } from '@app/contracts/land/dtos/region-dto/create-region.dto';
import { UpdateRegionDto } from '@app/contracts/land/dtos/region-dto/update-region.dto';
import { UpdateSensorDto } from '@app/contracts/land/dtos/sensor-dto/update-sensor.dto';
import { CreateSensorDto } from '@app/contracts/land/dtos/sensor-dto/create-sensor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const landAssetsPath = join(__dirname, '..', '..', 'assets', 'lands');
export const getUploadPath = (subdirectory: string) => {
  const rootPath = join(process.cwd(), 'assets', subdirectory);
  
  if (!existsSync(rootPath)) {
    mkdirSync(rootPath, { recursive: true });
  }

  return rootPath;
};
@Controller('lands')
export class LandController {
  constructor(private readonly landService: LandService
  ) {}



  
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: getUploadPath('lands'),
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `land-${uniqueName}.${ext}`;
        callback(null, filename);
      },
    }),
  }))
  async createLand(
    @UploadedFile() image: Express.Multer.File,
    @Body() createLandDto: CreateLandDto,
  ) {
    const imageUrl = `${image.filename}`; // Adjust the URL as needed
    const dtoWithImage = { ...createLandDto, image: imageUrl };
    return this.landService.createLand(dtoWithImage);
  }
  @Get('all')
  async findAllLands() {
    return this.landService.findAllLands();
  }

  @Get('land/:id')
  async findOneLand(@Param('id') id: string) {
    return this.landService.findOneLand(id);
  }

  @Put('land/:id')
  async updateLand(@Param('id') id: string, @Body() updateLandDto: UpdateLandDto) {
    return this.landService.updateLand(id, updateLandDto);
  }

  @Delete('land/:id')
  async removeLand(@Param('id') id: string) {
    return this.landService.removeLand(id);
  }



















  
  //------------------User EndPoint Testing ---------------------
  @Post('/user')
  async createUser(@Body()createUserDto : CreateUserDto){
        return this.landService.createUser(createUserDto)
  }
  @Get('/user')
  async findAllUsers(){
    return this.landService.findAllUser()
  }
  @Get('/user/:id')
 async findOneUser(@Param('id')id :string){
        return this.landService.findOneUser(id)
  }
  @Put('/user/:id')
 async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto)
  {
    return this.landService.updateUser(id , updateUserDto)
  }
  @Delete('/user/:id')
 async deleteUser(@Param('id') id: string)
  {
    return this.landService.removeUser(id)
  }










  //-----------------------------Region Endpoint Testing ---------------------------
  @Post('/region')
  async createRegion(@Body()createRegionDto : CreateRegionDto){
        return this.landService.createRegion(createRegionDto)
  }
  @Get('/region')
  async findAllRegion(){
    return this.landService.findAllRegion()
  }
  @Get('/region/:id')
 async findOneRegion(@Param('id')id :string){
        return this.landService.findOneRegion(id)
  }
  @Put('/region/:id')
 async updateRegion(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto)
  {
    return this.landService.updateRegion(id , updateRegionDto)
  }
  @Delete('/region/:id')
 async deleteRegion(@Param('id') id: string)
  {
    return this.landService.removeRegion(id)
  }
    //-----------------------------Sensor Endpoint Testing ---------------------------
    @Post('/sensor')
    async createSensor(@Body()createSensorDto : CreateSensorDto){
          return this.landService.createSensor(createSensorDto)
    }
    @Get('/sensor')
    async findAllSensor(){
      return this.landService.findAllSensor()
    }
    @Get('/sensor/:id')
   async findOneSensor(@Param('id')id :string){
          return this.landService.findOneSensor(id)
    }
    @Put('/sensor/:id')
   async updateSensor(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto)
    {
      return this.landService.updateSensor(id , updateSensorDto)
    }
    @Delete('/sensor/:id')
   async deleteSensor(@Param('id') id: string)
    {
      return this.landService.removeSensor(id)
    }
}
