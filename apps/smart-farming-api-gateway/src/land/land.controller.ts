import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors, NotFoundException, UseGuards } from '@nestjs/common';
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
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CreatePlantDto } from '@app/contracts/land/dtos/plant-dto/create-plant.dto';
import { UpdatePlantDto } from '@app/contracts/land/dtos/plant-dto/update-plant.dto';
import { AddPlantToRegionDto } from '@app/contracts/land/dtos/region-dto/add-plant-to-region.dto';
import { AddSensorToRegionDto } from '@app/contracts/land/dtos/region-dto/add-sensor-to-region.dto';
import { Region } from 'apps/land-service/src/regions/entities/region.entity';
import { AuthGuard } from '@nestjs/passport';

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
    const imageUrl = `lands/${image.filename}`; 
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
  async updateLand(
    @Param('id') id: string,
    @Body() updateLandDto: UpdateLandDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Get existing land data
    const existingLand = await this.landService.findOneLand(id);
    
    if (image) {
      // Delete old image if exists
      if (existingLand.image) {
        const oldImagePath = join(
          getUploadPath('lands'), 
          existingLand.image.split('/').pop()
        );
        
        if (existsSync(oldImagePath)) {
          unlinkSync(oldImagePath);
        }
      }
  
      
      // Add new image path to DTO
      const imageUrl = `lands/${image.filename}`;
      const dtoWithImage = { ...updateLandDto, image: imageUrl };
      return this.landService.updateLand(id, dtoWithImage);
    }
  
    // Update without image change
    return this.landService.updateLand(id, updateLandDto);
  }

  @Delete('land/:id')
  async removeLand(@Param('id') id: string) {
    return this.landService.removeLand(id);
  }


  @Get('land/plants/:id')
  async getPlantsByLandId(@Param('id') id: string) {
    return this.landService.findPlantsByLandId(id);
  }

  @Put('land/set-for-rent/:id')
 // @UseGuards(AuthGuard('jwt')) // Secure the endpoint
  async setLandForRent(
    @Param('id') id: string,
    @Body('userId') userId: string, // In practice, get this from auth token
    @Body('rentPrice') rentPrice: number,
  ) {
    return this.landService.setLandForRent(id, userId, rentPrice);
  }

  @Get('land/check/forRent')
  async findLandsForRent() {
    return this.landService.findLandsForRent();
  }
  @Get('users/:id')
  async findLandsByUserId(@Param('id') id: string) {
    return this.landService.findLandsByUserId(id);
  }
//-------------------------

@Post('/plant')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: getUploadPath('plants'), // Save to assets/plants
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `plant-${uniqueName}.${ext}`;
        callback(null, filename);
      },
    }),
  }))
  async createPlant(
    @UploadedFile() image: Express.Multer.File,
    @Body() createPlantDto: CreatePlantDto,
  ) {
    const imageUrl = `plants/${image.filename}`; // URL format: /plants/filename
    const dtoWithImage = { ...createPlantDto, imageUrl }; // Add imageUrl to DTO
    return this.landService.createPlant(dtoWithImage); // Call service
  }
@Get('/plant')
async findAllPlants(){
  
  return this.landService.findAllPlant()
}
@Get('/plant/:id')
async findOnePlant(@Param('id')id :string){
      console.log(id);
      return this.landService.findOnePlant(id)
}
@Put('/plant/:id')
async updatePlant(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto)
{
  return this.landService.updatePlant(id , updatePlantDto)
}
@Delete('/plant/:id')
async deletePlant(@Param('id') id: string)
{
  return this.landService.removePlant(id)
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

  @Get('region/users/:userId')
  async findRegionsByUserId(@Param('userId') userId: string) {
    try {
      return await this.landService.findRegionsByUserId(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Get('/region')
  async findAllRegion(){
    return this.landService.findAllRegion()
  }
  @Post('/region/addPlant')
  async addPlantToRegion(@Body() addPlantToRegionDto : AddPlantToRegionDto)
  {
    return this.landService.addPlantToRegion(addPlantToRegionDto)
  }
  @Post('/region/addSensor')
  async addSensorToRegion(@Body() addSensorToRegionDto : AddSensorToRegionDto)
  {
    return this.landService.addSensorToRegion(addSensorToRegionDto)
  }
  @Get('/region/:id')
 async findOneRegion(@Param('id')id :string){
        return this.landService.findOneRegion(id)
  }
  @Get('/region/connectedRegions/:userId')
  async findConnectedRegions(@Param('userId') userId: string) {
    return this.landService.findConnectedRegions(userId);
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
