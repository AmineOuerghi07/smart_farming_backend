// land-service.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { RegionsModule } from './regions/regions.module';
import { LandsModule } from './lands/lands.module';
import { SensorsModule } from './sensors/sensors.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PlantsModule } from './plants/plants.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/land-service'),
    UsersModule,
    RegionsModule,
    LandsModule,
    SensorsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'), 
      serveRoot: '/uploads', 
    }),
    PlantsModule,
  ],
  
})
export class LandServiceModule {}