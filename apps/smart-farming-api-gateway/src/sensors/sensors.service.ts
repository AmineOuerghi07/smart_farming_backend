import { CreateRegionDto } from '@app/contracts/sensor/dtos/region-dto/create-region.dto';
import { UpdateRegionDto } from '@app/contracts/sensor/dtos/region-dto/update-region.dto';
import { CreateSensorDto } from '@app/contracts/sensor/dtos/sensor-dto/create-sensor.dto';
import { UpdateSensorDto } from '@app/contracts/sensor/dtos/sensor-dto/update-sensor.dto';
import { REGION_PATTERNS } from '@app/contracts/sensor/region.patterns';
import { SENSORS_PATTERNS } from '@app/contracts/sensor/sensor.patterns';
import { SENSORS_NAME } from '@app/contracts/sensor/sensors.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class SensorsService {
  constructor(@Inject(SENSORS_NAME) private sensorClient: ClientProxy) {}
     async createSensor(createSensorDto : CreateSensorDto){
        return this.sensorClient.send(SENSORS_PATTERNS.CREATE ,createSensorDto).toPromise()
      }
      async findOneSensor(id: string) {
        return this.sensorClient.send<any, string>(SENSORS_PATTERNS.FIND_ONE,  id ).toPromise();
      }
    
      async removeSensor(id: string) {
        return this.sensorClient.send<any, string>(SENSORS_PATTERNS.REMOVE,  id ).toPromise();
      }    
      async updateSensor(id: string, updateSensorDto: UpdateSensorDto) {
        updateSensorDto.id = id;
        return this.sensorClient.send(SENSORS_PATTERNS.UPDATE, updateSensorDto).toPromise();
      }
    
      async findAllSensor() {
        return this.sensorClient.send(SENSORS_PATTERNS.FIND_ALL, {}).toPromise();
      }

    //-------------------------------
        async createRegion(createRegionDto : CreateRegionDto){
            return this.sensorClient.send(REGION_PATTERNS.CREATE ,createRegionDto).toPromise()
          }
          async findOneRegion(id: string) {
            return this.sensorClient.send<any, string>(REGION_PATTERNS.FIND_ONE,  id ).toPromise();
          }
        
          async removeRegion(id: string) {
            return this.sensorClient.send<any, string>(REGION_PATTERNS.REMOVE,  id ).toPromise();
          }
        
          async updateRegion(id: string, updateRegionDto: UpdateRegionDto) {
            updateRegionDto.id = id;
            return this.sensorClient.send<any, UpdateRegionDto>(REGION_PATTERNS.UPDATE, updateRegionDto).toPromise();
          }
        
          async findAllRegion() {
            return this.sensorClient.send(REGION_PATTERNS.FIND_ALL, {}).toPromise();
          }

}
