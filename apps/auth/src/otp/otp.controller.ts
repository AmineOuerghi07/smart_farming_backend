import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OtpService } from './otp.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OTP_PATTERNS } from '@app/contracts/auth/otp/otp.patterns';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @MessagePattern(OTP_PATTERNS.SEND_OTP_EMAIL)
  async forgotPasswordOtpByEmail(@Payload() command : { email : string}) {
    return this.otpService.forgotPasswordOtpByEmail(command.email);
  }
  
  @MessagePattern(OTP_PATTERNS.SEND_OTP_PHONE)
  async forgotPasswordOtpByPhone(@Payload() command : {phonenumber : string}) {
    console.log('Received command in controller:', command);
    return this.otpService.forgotPasswordOtpByPhone(command.phonenumber);
  }


  @MessagePattern(OTP_PATTERNS.VERIFY_OTP)
  async verifyOtp(@Payload() command : { otp: string, userId : string }) {
    return this.otpService.verifyOtp(command.userId, command.otp);
  }
  @MessagePattern(OTP_PATTERNS.RESET_PASSWORD)
  async resetPasswordOtp(@Payload() command : ResetPasswordDto) {
    console.log(command)
    return this.otpService.resetPassword(command);
  }
  


}