import { LAND_NAME, LAND_QUEUE } from '@app/contracts/land/land.rmq';
import { Module } from '@nestjs/common';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { LandController } from './land.controller';
import { LandService } from './land.service';
import { RegionsController } from 'apps/land-service/src/regions/regions.controller';
import { SensorsController } from 'apps/land-service/src/sensors/sensors.controller';
import { RegionsService } from 'apps/land-service/src/regions/regions.service';
import { UsersService } from 'apps/land-service/src/users/users.service';
import { SensorsService } from 'apps/land-service/src/sensors/sensors.service';
import { UsersController } from 'apps/land-service/src/users/users.controller';

@Module({
  imports: [
 
    ClientsModule.register([
          {
            name: LAND_NAME,
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: LAND_QUEUE,
              queueOptions: {
                durable: false
              },
            },
          },
        ]),
  ],
  controllers: [LandController],
  providers: [LandService],
})
export class LandModule {}
