// land-service.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { RegionsModule } from './regions/regions.module';
import { LandsModule } from './lands/lands.module';
import { SensorsModule } from './sensors/sensors.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/land-service'),
    UsersModule,
    RegionsModule,
    LandsModule,
    SensorsModule,
    CacheModule.registerAsync({  
              isGlobal: true,  
              useFactory: async () => ({  
                store: await redisStore({  
                  socket: {  
                    host: 'localhost',  
                    port: 6379,  
                  },        
                }),      
              }),    
        }), 
  ],
})
export class LandServiceModule {}