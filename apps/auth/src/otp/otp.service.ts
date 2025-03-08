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

  const otpNumber: string = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
  console.log(`Generated OTP: ${otpNumber} for user ${user.id}`);

  // Generate a hash of the OTP
  const otpHash = await bcrypt.hash(otpNumber, 10);

  // Delete old OTPs for this user
  await this.otpModel.deleteMany({ userId: user.id });

  let otp = new Otp();
  otp.otp = otpHash;
  otp.userId = user.id;
  otp.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

  await this.otpModel.create(otp);
  console.log(`Stored OTP hash in DB for user ${user.id}`);

  try {
    await this.emailService.sendOtp(email, otpNumber);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP to ${email}:`, error);
    throw new HttpException('Error sending OTP', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Return OTP and userId in the response
  return { message: 'OTP sent successfully', otp: otpNumber, userId: user.id };
}




    // Forgot Password OTP functionality
    async forgotPasswordOtpByPhone(phonenumber: string) {
      const user = await this.userService.findOneByPhoneNumber(phonenumber);
      
      if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const otpNumber: string = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
  
      let otp = new Otp();
      otp.otp = await bcrypt.hash(otpNumber, 10); // Hash OTP before storing
      otp.userId = user.id;
      otp.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
  
      await this.otpModel.create(otp);
  
      // Send OTP via SMS
      await this.smsService.sendOtp(phonenumber, otpNumber);
  
      // ✅ Return OTP in response
      return { message: 'OTP sent successfully', otp: otpNumber };
  }
  
  
/*******************OTP *********************/
async verifyOtp(email: string, otpReceived: string) {
  const user = await this.userService.findOneByEmail(email);
  if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  const otpRecord = await this.otpModel.findOne({ userId: user.id });
  if (!otpRecord) {
      throw new HttpException('OTP not found', HttpStatus.NOT_FOUND);
  }

  // Vérifiez si l'OTP a expiré
  if (new Date() > otpRecord.otpExpires) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
  }

  // Comparez l'OTP reçu avec le hash stocké
  const isValidOtp = await bcrypt.compare(otpReceived, otpRecord.otp);
  if (!isValidOtp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
  }

  return { message: 'OTP verified successfully' , user};
}
async resetPassword(req: ResetPasswordDto) {
  if (!req.newPassword || !req.confirmPassword) {
    throw new HttpException('Passwords cannot be empty', HttpStatus.BAD_REQUEST);
  }
  const newPassword = req.newPassword.trim();
  const confirmPassword = req.confirmPassword.trim();
  if (newPassword !== confirmPassword) {
    console.log(`New Password: "${newPassword}", Confirm Password: "${confirmPassword}"`);
    throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
  }
  const user = await this.userService.findOne(req.userId);
  if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }
  console.log('User before update:', { id: user.id, email: user.email, password: user.password });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log('New hashed password:', hashedPassword);
  await this.userService.updateUser(user.id.toString(), { password: hashedPassword });
  const updatedUser = await this.userService.findOne(req.userId);
  console.log('User after update:', { id: updatedUser.id, email: updatedUser.email, password: updatedUser.password });
  return { message: 'Password reset successfully', userId: user.id };
}
}