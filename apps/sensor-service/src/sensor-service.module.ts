import { Module } from '@nestjs/common';
import { RegionsModule } from './regions/regions.module';
import { SensorsModule } from './sensors/sensors.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
     MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/sensor-service'),
     RegionsModule,
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
          }), ],

})
export class SensorServiceModule {}
