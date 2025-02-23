import { Injectable, Inject } from '@nestjs/common';
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
  //-------------------------------------------------
  async createUser(createUserDto : CreateUserDto){
    return this.landClient.send(USER_PATTERNS.CREATE ,createUserDto).toPromise()
  }
  async findOneUser(id: string) {
    return this.landClient.send<any, string>(USER_PATTERNS.FIND_ONE,  id ).toPromise();
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
    //-------------------------------------------------
    async createRegion(createRegionDto : CreateRegionDto){
        return this.landClient.send(REGION_PATTERNS.CREATE ,createRegionDto).toPromise()
      }
      async findOneRegion(id: string) {
        return this.landClient.send<any, string>(REGION_PATTERNS.FIND_ONE,  id ).toPromise();
      }
    
      async removeRegion(id: string) {
        return this.landClient.send<any, string>(REGION_PATTERNS.REMOVE,  id ).toPromise();
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
