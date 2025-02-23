import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../services/Email.service'; 
import { SmsService } from '../services/Sms.service'; 
import { User } from './entities/user.entity';

@Injectable()
export class IdentityService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService : EmailService, // Assuming the email service is injected
    private readonly smsService: SmsService, // Assuming the SMS service is injected
  ) {}

  // Register method
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    const { confirmpassword, ...userData } = createUserDto;

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return { message: 'User registered successfully', user: savedUser };
  }

  // Login method
  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = { id: user._id, email: user.email, roles: user.roles };
    const token = this.jwtService.sign(payload);

    return { message: 'Login successful', token };
  }

  // Validate JWT Token
  validateToken(jwt: string) {
    try {
      const decoded = this.jwtService.verify(jwt);
      return decoded;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  // Forgot Password functionality
  async forgotPassword(command: { email?: string; phoneNumber?: string }) {
    const { email, phoneNumber } = command;

    let user;
    if (email) {
      user = await this.userModel.findOne({ email });
    } else if (phoneNumber) {
      user = await this.userModel.findOne({ phoneNumber });
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const resetToken = this.jwtService.sign(
      { id: user._id, email: user.email },
      { secret: 'your-reset-secret', expiresIn: '1h' },
    );

    this.sendResetToken(user, resetToken);

    return { message: 'Password reset link sent successfully' };
  }

  // Reset Password functionality
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    let decoded;
    try {
      decoded = this.jwtService.verify(token, { secret: 'your-reset-secret' });
    } catch (error) {
      throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findById(decoded.id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  // Method to send reset token (either via email or SMS)
  sendResetToken(user: User, resetToken: string) {
    if (user.email) {
      // Send email with reset link (you could use a service like nodemailer)
      const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
      this.emailService.sendOtp(user.email, resetLink); // Assuming the service is integrated
      console.log(`Sending reset link to email: ${user.email}`);
    } else if (user.phonenumber) {
      // Send SMS (you can use an SMS service like Twilio)
      this.smsService.sendOtp(user.phonenumber, resetToken); // Assuming the service is integrated
      console.log(`Sending reset token via SMS to: ${user.phonenumber}`);
    }
  }

  async getUserbyUsername(username: string) {
    const loginResult = await this.userModel.findOne({ username });
    if (!loginResult) {
      return null;
    }

    const { __v, _id, ...userData } = loginResult.toObject();
    return { id: _id, ...userData };
  }

  //  Update User
  async updateUser(id: string, updateData: any) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return updatedUser;
  }

  // Delete User
  async deleteUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'User deleted successfully' };
  }

  async googleLogin(googleUser: any) {
    console.log("Received Google User:", googleUser);
    let user = await this.userModel.findOne({ email: googleUser.email });
    if (!user) {
      user = new this.userModel({
        email: googleUser.email,
        fullname: googleUser.fullname,
        password: null,
        phonenumber: "N/A",
        address: "N/A",
      });
      await user.save();
    }
    return user;
  }
  

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if(user)
      return user;
    
    return null;
  }
  

  async findOneByEmail(email : string)
  {
    const user = await this.userModel.findOne({email : email});
    if(user)
      return user;

    return null;
  }

  async findOneByPhoneNumber(phoneNumber : string)
  {
    const user = await this.userModel.findOne({phonenumber : phoneNumber});
    if(user)
      return user;

    return null;
  }
}
