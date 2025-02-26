import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { ClientProxy } from '@nestjs/microservices';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';
import { UserDto } from '@app/contracts/user/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, @Inject(ORDER_NAME) private orderClient : ClientProxy) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto._id = new Types.ObjectId(createUserDto._id)
    this.orderClient.emit(CUSTOMER_PATTERNS.CREATE, createUserDto)
    return await this.userModel.create(createUserDto)
  }

  async findAll(){
    return await this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return await this.userModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    let updates : UserDto = new UserDto()

    updates.name = updateUserDto.name
    updates.email = updateUserDto.email
    updates.phone = updateUserDto.phone

    console.log("Updates ---------------")

    console.log(updates)
    
    console.log("------------------------")


    let user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updates,
      { new: true }
    )



    this.orderClient.emit(CUSTOMER_PATTERNS.UPDATE, updateUserDto)

    return user;
  }

  async remove(id: string): Promise<User> {
    let user = this.userModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
    this.orderClient.emit(CUSTOMER_PATTERNS.REMOVE, id)
    return user
  }
}