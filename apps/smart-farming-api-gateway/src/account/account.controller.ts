import { Body, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AccountService } from './account.service';
import { Delete, HttpCode, Param, Post ,Put,Request, UseFilters, UseGuards} from '@nestjs/common/decorators';
import { CreateUserDto } from './dto/create-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';


@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('hello')
  async getHello(): Promise<any> {
    return this.accountService.hello();
  }
  @Post('sign-up')
  async register(@Body() req : CreateUserDto) {
      return this.accountService.register(req);
    }

    
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.NOT_FOUND)
  async login(@Body() req: LoginDto) {
      console.log(req);
      try
      {
        let response = await this.accountService.login(req);
        return response;
      }catch(e)
      {
        throw new HttpException("Invalid Credentials", HttpStatus.NOT_FOUND)
      }
  } 


 @Get('profile')
 async getProfile(@Request() req) {
   return req.user; // Access user data from the request
 }


  @Put('update/:id')
  async updateUser(@Param('id') id: string, @Body() updateData) {
    return this.accountService.updateUser(id, updateData);
  }

  @Delete('remove/:id')
  async deleteUser(@Param('id') id: string) {
    return this.accountService.deleteUser(id);
  }


  @Post('google-login')
async googleLogin(@Body() req) {
  return this.accountService.googleLogin(req);
}
///
@Post('forgot-password-otp-email')
async forgotPasswordOtpByEmail(@Body() req : {email : string}) {
  return this.accountService.forgotPasswordOtpByEmail(req);
}

@Post('forgot-password-otp-phone')
async forgotPasswordOtpByPhone(@Body() req : {phone : string}) {
  return this.accountService.forgotPasswordOtpByPhone(req);
}

@Post('verify-otp')
async verifyOtp(@Body() req : { otp: string, userId : string }) {
  return this.accountService.verifyOtp(req);

}
  @Post('reset-password')
async resetPasswordOtp(@Body() req : ResetPasswordDto) {
  console.log(req);
  return this.accountService.resetPasswordOtp(req);
}



}







