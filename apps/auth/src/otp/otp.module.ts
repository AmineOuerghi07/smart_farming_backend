import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { Otp, OtpSchema } from './entities/otp.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '../identity/identity.module';
import { EmailService } from '@app/contracts/services/email.service';
import { MailingModule } from '@app/contracts/services/mailing.module';



@Module({
  imports:[MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]), IdentityModule, MailingModule],
  controllers: [OtpController],
  providers: [OtpService, EmailService],
})
export class OtpModule {}
