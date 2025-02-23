import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmpassword: string;

  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
