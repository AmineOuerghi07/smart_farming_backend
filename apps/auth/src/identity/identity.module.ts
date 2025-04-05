import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { User, userSchema } from './entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LAND_NAME, LAND_QUEUE } from '@app/contracts/land/land.rmq';
import { RedisCache } from '../cache/redis.cache.module';
import { EmailService } from '@app/contracts/services/email.service';
import { SmsService } from '@app/contracts/services/sms.service';
import { MailingModule } from '@app/contracts/services/mailing.module';


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
              urls: [ process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
              queue: LAND_QUEUE,
              queueOptions: {
                durable: false,
              },
            },
          })
      },
    ]),
    RedisCache,
    MailingModule
   
  ],
  controllers: [IdentityController],
  providers: [IdentityService, EmailService, SmsService,
    
  ],
  exports: [IdentityService]
})
export class IdentityModule { }
