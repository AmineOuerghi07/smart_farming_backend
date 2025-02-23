import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { Otp, OtpSchema } from './entities/otp.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '../identity/identity.module';
import { EmailService } from '../services/Email.service';
import { SmsService } from '../services/Sms.service';


@Module({
  imports:[MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]), IdentityModule],
  controllers: [OtpController],
  providers: [OtpService, EmailService, SmsService],
})
export class OtpModule {}
