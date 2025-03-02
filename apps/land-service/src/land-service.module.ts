// land-service.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { RegionsModule } from './regions/regions.module';
import { LandsModule } from './lands/lands.module';
import { SensorsModule } from './sensors/sensors.module';
import { RedisCache } from './cache/redis.cache.module';


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/land-service'),
    UsersModule,
    RegionsModule,
    LandsModule,
    SensorsModule,
    RedisCache
    
  ],
})
export class LandServiceModule {}