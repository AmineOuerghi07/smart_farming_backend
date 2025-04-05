import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateLandDto } from '@app/contracts/land/dtos/land-dto/create-land.dto';
import { UpdateLandDto } from '@app/contracts/land/dtos/land-dto/update-land.dto';
import { LAND_NAME } from '@app/contracts/land/land.rmq';
import { LAND_PATTERNS } from '@app/contracts/land/land.patterns';
import { CreateUserDto } from '@app/contracts/land/dtos/user-dto/create-user.dto';
import { USER_PATTERNS } from '@app/contracts/land/user.patterns';
import { UpdateUserDto } from '@app/contracts/land/dtos/user-dto/update-user.dto';
import { CreateRegionDto } from '@app/contracts/land/dtos/region-dto/create-region.dto';
import { UpdateRegionDto } from '@app/contracts/land/dtos/region-dto/update-region.dto';
import { REGION_PATTERNS } from '@app/contracts/land/region.patterns';
import { CreateSensorDto } from '@app/contracts/land/dtos/sensor-dto/create-sensor.dto';
import { UpdateSensorDto } from '@app/contracts/land/dtos/sensor-dto/update-sensor.dto';
import { SENSOR_PATTERNS } from '@app/contracts/land/sensor.patterns';
import { CreatePlantDto } from '@app/contracts/land/dtos/plant-dto/create-plant.dto';
import { PLANT_PATTERNS } from '@app/contracts/land/plant.patterns';
import { AddPlantToRegionDto } from '@app/contracts/land/dtos/region-dto/add-plant-to-region.dto';
import { AddSensorToRegionDto } from '@app/contracts/land/dtos/region-dto/add-sensor-to-region.dto';
import { UpdatePlantDto } from '@app/contracts/land/dtos/plant-dto/update-plant.dto';

@Injectable()
export class LandService {
  constructor(@Inject(LAND_NAME) private landClient: ClientProxy) {}

  async createLand(createLandDto: CreateLandDto) {
    return this.landClient.send(LAND_PATTERNS.CREATE, createLandDto).toPromise();
  }

  async findOneLand(id: string) {
    return this.landClient.send<any, string>(LAND_PATTERNS.FIND_ONE,  id ).toPromise();
  }

  async removeLand(id: string) {
    return this.landClient.send<any, string>(LAND_PATTERNS.REMOVE,  id ).toPromise();
  }

  async updateLand(id: string, updateLandDto: UpdateLandDto) {
    updateLandDto.id = id;
    return this.landClient.send(LAND_PATTERNS.UPDATE, updateLandDto).toPromise();
  }

  async findAllLands() {
    return this.landClient.send(LAND_PATTERNS.FIND_ALL, {}).toPromise();
  }

  async findPlantsByLandId(id: string){
    return this.landClient.send<any , string>(LAND_PATTERNS.FIND_LAND_PLANTS,id).toPromise()
  }
  //-------------------------------------------------
  async createUser(createUserDto : CreateUserDto){
    return this.landClient.send(USER_PATTERNS.CREATE ,createUserDto).toPromise()
  }
  async findOneUser(id: string) {
    return await this.landClient.send<any, string>(USER_PATTERNS.FIND_ONE,  id ).toPromise();
  }

  async removeUser(id: string) {
    return this.landClient.send<any, string>(USER_PATTERNS.REMOVE,  id ).toPromise();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    updateUserDto.id = id;
    return this.landClient.send(USER_PATTERNS.UPDATE, updateUserDto).toPromise();
  }

  async findAllUser() {
    return this.landClient.send(USER_PATTERNS.FIND_ALL, {}).toPromise();
  }
  //--------------------------------------------------------
  async createPlant(createPlantDto : CreatePlantDto){
    return this.landClient.send(PLANT_PATTERNS.CREATE ,createPlantDto).toPromise()
  }
  async findOnePlant(id: string) {
    return await this.landClient.send<any, string>(PLANT_PATTERNS.FIND_ONE,  id ).toPromise();
  }

  async removePlant(id: string) {
    return this.landClient.send<any, string>(PLANT_PATTERNS.REMOVE,  id ).toPromise();
  }

  async updatePlant(id: string, updatePlantDto: UpdatePlantDto) {
    updatePlantDto.id = id;
    return this.landClient.send(PLANT_PATTERNS.UPDATE, updatePlantDto).toPromise();
  }

  async findAllPlant() {
    console.log('Sending pattern:', PLANT_PATTERNS.FIND_ALL);
    return this.landClient.send(PLANT_PATTERNS.FIND_ALL, {}).toPromise();
  }
  async findLandsByUserId(userId: string) {
    if (!userId) {
        throw new Error(' User ID is required but received undefined/null');
    }


    return this.landClient.send(LAND_PATTERNS.FIND_BY_USER_ID, userId).toPromise();
}
    //-------------------------------------------------
    async createRegion(createRegionDto : CreateRegionDto){
        return this.landClient.send<any, CreateRegionDto>(REGION_PATTERNS.CREATE ,createRegionDto).toPromise()
      }

      async findRegionsByUserId(userId: string) {
        const lands = await this.findLandsByUserId(userId);
        if (!lands || lands.length === 0) {
          return [];
        }
        const landIds = lands.map((land) => land._id);
        return this.landClient.send(REGION_PATTERNS.FIND_BY_LAND_IDS, landIds).toPromise();
      }
      async findOneRegion(id: string) {
        return this.landClient.send<any, string>(REGION_PATTERNS.FIND_ONE,  id ).toPromise();
      }
    
      async removeRegion(id: string) {
        return this.landClient.send<any, string>(REGION_PATTERNS.REMOVE,  id ).toPromise();
      }
    async addPlantToRegion(addPlantToRegionDto :AddPlantToRegionDto)
    {
      const { regionId, plantId, quantity } = addPlantToRegionDto;

    
    if (!regionId || !plantId || !quantity || quantity <= 0) {
      throw new BadRequestException('regionId, plantId, and a positive quantity are required');
    }
        return this.landClient.send<any,AddPlantToRegionDto>(REGION_PATTERNS.REGION_ADD_PLANT,addPlantToRegionDto).toPromise();
    }
    async addSensorToRegion(addSensorToRegionDto: AddSensorToRegionDto) {
      const { regionId, sensorId, sensorName, value, threshold } = addSensorToRegionDto;
  
      // Validation
      if (!regionId || !sensorId || !sensorName || value === undefined || threshold === undefined) {
        throw new BadRequestException('regionId, sensorId, sensorName, value, and threshold are required');
      }
  
 
      return this.landClient
        .send<any, AddSensorToRegionDto>(REGION_PATTERNS.REGION_ADD_SENSOR, addSensorToRegionDto)
        .toPromise(); 
    }
      async updateRegion(id: string, updateRegionDto: UpdateRegionDto) {
        updateRegionDto.id = id;
        return this.landClient.send<any, UpdateRegionDto>(REGION_PATTERNS.UPDATE, updateRegionDto).toPromise();
      }
    
      async findAllRegion() {
        return this.landClient.send(REGION_PATTERNS.FIND_ALL, {}).toPromise();
      }
       //-------------------------------------------------
       async createSensor(createSensorDto : CreateSensorDto){
        return this.landClient.send(SENSOR_PATTERNS.CREATE ,createSensorDto).toPromise()
      }
      async findOneSensor(id: string) {
        return this.landClient.send<any, string>(SENSOR_PATTERNS.FIND_ONE,  id ).toPromise();
      }
    
      async removeSensor(id: string) {
        return this.landClient.send<any, string>(SENSOR_PATTERNS.REMOVE,  id ).toPromise();
      }    
      async updateSensor(id: string, updateSensorDto: UpdateSensorDto) {
        updateSensorDto.id = id;
        return this.landClient.send(SENSOR_PATTERNS.UPDATE, updateSensorDto).toPromise();
      }
    
      async findAllSensor() {
        return this.landClient.send(SENSOR_PATTERNS.FIND_ALL, {}).toPromise();
      }
}
