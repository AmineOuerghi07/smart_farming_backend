import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { EmailService } from "./email.service";

@Module({
  providers: [SmsService, EmailService],
  exports: [SmsService, EmailService],
})
export class MailingModule {}