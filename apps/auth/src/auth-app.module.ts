import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { AuthModule } from './guards/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpModule } from './otp/otp.module';




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


        
       

    MongooseModule.forRoot(process.env.DATABASE_URL ?? "mongodb://localhost:27017/farm"),

    OtpModule
  ],

})
export class AuthAppModule {}
