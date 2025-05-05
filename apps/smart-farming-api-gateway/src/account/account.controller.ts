import { Body, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AccountService } from './account.service';
import { Delete, HttpCode, Param, Post ,Put,Request, UploadedFile, UseFilters, UseGuards, UseInterceptors} from '@nestjs/common/decorators';
import { CreateUserDto } from './dto/create-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { getUploadPath } from '../product/product.controller';
import { UpdateUserDto } from './dto/update-account.dto';


@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('hello')
  async getHello(): Promise<any> {
    return this.accountService.hello();
  }
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: getUploadPath('users'), // Specify the directory where the files should be uploaded
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `user-${uniqueName}.${ext}`;
        callback(null, filename);
      },
    }),
  }))
  async register(@Body() req: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
    try {
      // Handle file upload and add image URL if file exists
      if (file) {
        req.image = `users/${file.filename}`; // Adjust according to where your file is stored
      }

      // Send the registration data to the microservice
      return await this.accountService.register(req);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Error during registration: ${error.message}`);
    }
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
 @UseInterceptors(FileInterceptor('file', {
   storage: diskStorage({
     destination: getUploadPath('users'),
     filename: (req, file, callback) => {
       const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
       const ext = file.originalname.split('.').pop();
       const filename = `user-${uniqueName}.${ext}`;
       callback(null, filename);
     },
   }),
 }))
 async updateUser(
   @Param('id') id: string,
   @UploadedFile() file: Express.Multer.File,
   @Body() updateData: UpdateUserDto,
 ) {
   try {
     if (file) {
       updateData.image = `users/${file.filename}`;
     }

     if (updateData.email) {
       updateData.email = updateData.email.trim();
     }

     // Update user in the database
     return await this.accountService.updateUser(id, updateData);
   } catch (e) {
     console.error('Error updating user:', e);
     throw new HttpException(
       `Updating User failed: ${e.message || 'Unknown error'}`,
       HttpStatus.BAD_REQUEST
     );
   }
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
async forgotPasswordOtpByPhone(@Body() req : {phonenumber : string}) {
  console.log('API Gateway received phone number:', req.phonenumber);
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

@Get('get-account/:id')
async getAccountById(@Param('id') id: string) {
  try {
    const account = await this.accountService.findOne(id);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException('Error fetching account', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}







