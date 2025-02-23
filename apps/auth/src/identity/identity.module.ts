import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { EmailService } from '../services/Email.service';
import { SmsService } from '../services/Sms.service';
import { User, userSchema } from './entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    PassportModule,
  ],
  controllers: [IdentityController],
  providers: [IdentityService , EmailService, SmsService],
  exports: [IdentityService]
})
export class IdentityModule { }
