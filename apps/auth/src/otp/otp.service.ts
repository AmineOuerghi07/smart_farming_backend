import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { InjectModel } from '@nestjs/mongoose';
import { IdentityService } from '../identity/identity.service';
import { Otp } from './entities/otp.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../services/Email.service';
import { SmsService } from '../services/Sms.service';



@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private readonly otpModel: Model<Otp> ,private readonly userService : IdentityService, private readonly emailService: EmailService, private readonly smsService: SmsService){}
  
  // Forgot Password OTP functionality
  async forgotPasswordOtpByEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otpNumber : number = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    let otp = new Otp()
    otp.otp = otpNumber.toString();
    otp.userId = user.id;
    otp.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await this.otpModel.create(otp);

      // Send OTP via email
      await this.emailService.sendOtp(email, otp.otp);
   

    return { message: 'OTP sent successfully' };
  }


    // Forgot Password OTP functionality
    async forgotPasswordOtpByPhone( phonenumber: string ) {
      const user = await this.userService.findOneByPhoneNumber(phonenumber);
      
  
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const otpNumber : number = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      let otp = new Otp()
      otp.otp = otpNumber.toString();
      otp.userId = user.id;
      otp.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      await this.otpModel.create(otp);
  
    
        // Send OTP via SMS
        await this.smsService.sendOtp(phonenumber, otp.otp);
      
  
      return { message: 'OTP sent successfully' };
    }
  

  // Verify OTP functionality
  async verifyOtp(req: { otp: string, userId : string }) {
    const { userId, otp } = req;
    
    const user = await this.userService.findOne(userId);
    const otpSchema : Otp | null = await this.otpModel.findOne({ userId });


    if (!user || otpSchema?.otp !== otp || !otpSchema?.otpExpires || otpSchema?.otpExpires < new Date()) {
        throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }
 // No error since otpExpires can be null now
    await this.otpModel.deleteOne({ userId });

    return { message: 'OTP verified successfully' };
}



  // Reset Password with OTP functionality
  async resetPassword(req: ResetPasswordDto) {
    //const { email, phone, newPassword, confirmPassword } = req;

    if (req.newPassword !== req.confirmPassword) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOne(req.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.password = await bcrypt.hash(req.newPassword, 10); // Hash the password in a real implementation
    
    await this.userService.updateUser(user.id.toString(), {password : user.password})

    return { message: 'Password reset successfully' };
  }

}
