import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { AuthModule } from './guards/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpModule } from './otp/otp.module';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_NAME, ORDER_QUEUE } from '@app/contracts/order/order.rmq';


@Module({
  imports: [
    IdentityModule,  // Make sure this module is imported
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    JwtModule.register({ 
          global: true,
          privateKey: 'secretKey_YouCANWritewateverulikeheesecretKey_YouCANWritewateverulikehee',
          signOptions: { expiresIn: '1h' }  // Token expiration options
        }),

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
        
       

    MongooseModule.forRoot(process.env.DATABASE_URL ?? "mongodb://localhost:27017/farm"),

    OtpModule
  ],

})
export class AuthAppModule {}
