import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {  Types } from 'mongoose';

export class CreateUserDto {

  _id : Types.ObjectId

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  phone : string;
}