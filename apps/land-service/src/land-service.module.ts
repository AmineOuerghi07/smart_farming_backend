// land-service.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RegionsModule } from './regions/regions.module';
import { LandsModule } from './lands/lands.module';
import { SensorsModule } from './sensors/sensors.module';
import { RedisCache } from './cache/redis.cache.module';


import { NOTIFICATION_NAME, NOTIFICATION_QUEUE } from '@app/contracts/notification/notification.rmq';
import { PlantsModule } from './plants/plants.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/land-service', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected successfully');
        });
        connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
        });
        return connection;
      }
    }),
    ClientsModule.register([
      {
        name: NOTIFICATION_NAME,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: NOTIFICATION_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
    RegionsModule,
    LandsModule,
    SensorsModule,
    RedisCache,
    
    PlantsModule
  ],
})
export class LandServiceModule {}