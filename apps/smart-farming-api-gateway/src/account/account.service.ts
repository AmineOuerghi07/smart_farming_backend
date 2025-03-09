import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport, MessagePattern } from '@nestjs/microservices';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AUTH_NAME } from '@app/contracts/auth/auth.rmq';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { OTP_PATTERNS } from '@app/contracts/auth/otp/otp.patterns';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AccountService {

  constructor(@Inject(AUTH_NAME) private client : ClientProxy) {
    

  }

    public register(command) {
        return this.client.send<any, any>(AUTH_PATTERNS.REGISTER, command);
    }

  
 
  public async login(loginDto: LoginDto) {
    try
    {
      console.log("Test")
      return await lastValueFrom(this.client.send<any, LoginDto>(AUTH_PATTERNS.LOGIN, loginDto));
    }
    catch(e)
    {
      console.log("HI")
      throw e;
    }
     
  }

 
  public me(command): any {
    return this.client.send<any, any>('me', command);  
  }

  
 

  public resetPassword(command): any {
    return this.client.send<any, ResetPasswordDto>('reset-password', command); 
  }

  
  public hello(): any {
    try {
      return this.client.send<any, any>('helloFromApi', 'hello from api!');
    } catch (error) {
      console.error('Error sending hello message:', error);
      throw error;
    }
  }



  ///
  public async updateUser(id: string, updateData: any) {
    try
    {
      return await lastValueFrom(this.client.send(AUTH_PATTERNS.UPDATE_USER, { id, updateData }));  
    }catch(e)
    {
      console.log("Error in update ?")
      throw e;
    }
    
  }

  // Delete User
  public async deleteUser(id: string) {
    return  this.client.send(AUTH_PATTERNS.DELETE_USER, { id });
  }


  public googleLogin(command): any {
    return this.client.send<any, any>(AUTH_PATTERNS.GOOGLE_LOGIN, command);
  }


  public forgotPasswordOtpByEmail(command): any {
    return this.client.send<any, any>(OTP_PATTERNS.SEND_OTP_EMAIL, command);
  }

  public forgotPasswordOtpByPhone(command): any {
    console.log(command)
    return this.client.send<any, any>(OTP_PATTERNS.SEND_OTP_PHONE, command);
  }


  public verifyOtp(command): any {
    return this.client.send<any, any>(OTP_PATTERNS.VERIFY_OTP, command);
  }

  public resetPasswordOtp(command : ResetPasswordDto): any {
    console.log(command)
    return this.client.send<any, ResetPasswordDto>(OTP_PATTERNS.RESET_PASSWORD, command);
  }
  
  public async findOne(id: string): Promise<any> {
    return lastValueFrom(this.client.send(AUTH_PATTERNS.FIND_ONE, { id }));
  }
}
