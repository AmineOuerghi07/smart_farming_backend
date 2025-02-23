import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(){
    console.log("i m insoide the service !! ")
    return await this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async update(id: ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true }
    ).exec();
  }

  async remove(id: ObjectId): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}