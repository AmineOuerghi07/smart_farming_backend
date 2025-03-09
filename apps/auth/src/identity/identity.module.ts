import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { EmailService } from '../services/Email.service';
import { SmsService } from '../services/Sms.service';
import { User, userSchema } from './entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LAND_NAME, LAND_QUEUE } from '@app/contracts/land/land.rmq';
import { RedisCache } from '../cache/redis.cache.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    PassportModule,

    ClientsModule.registerAsync([
      {
        name: LAND_NAME,
        useFactory: async () => (
          {

            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: LAND_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
    ]),
    RedisCache
   
  ],
  controllers: [IdentityController],
  providers: [IdentityService, EmailService, SmsService,
    
  ],
  exports: [IdentityService]
})
export class IdentityModule { }
