import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';
import { UserDto } from '@app/contracts/user/user.dto';
import { RedisService } from '../cache/redis.cache.service';
import { AUTH_NAME } from '@app/contracts/auth/auth.rmq';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, @Inject(ORDER_NAME) private orderClient : ClientProxy, private readonly redisService : RedisService, @Inject(AUTH_NAME) private readonly authClient : ClientProxy) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try
    {

    
    createUserDto._id = new Types.ObjectId(createUserDto._id)
    let user : User = await this.userModel.create(createUserDto)
    this.orderClient.emit(CUSTOMER_PATTERNS.CREATE, createUserDto)

    return user;
    }catch(e)
    {
      await this.cancelCreation(createUserDto._id.toString())
      throw new RpcException("Operation failed")
    }
  }

  async findAll(){
    return await this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return await this.userModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try
    {
    let updates : UserDto = new UserDto()

    updates.name = updateUserDto.name
    updates.email = updateUserDto.email
    updates.phone = updateUserDto.phone

    let user : User = await this.userModel.findById(new Types.ObjectId(id))
    
    await this.redisService.set(user._id.toString(), user)

    await this.userModel.findByIdAndUpdate(user._id, updates, { new: true})
    // let user = await this.userModel.findByIdAndUpdate(
    //   new Types.ObjectId(id),
    //   updates,
    //   { new: true }
    // )



      await lastValueFrom(this.orderClient.send(CUSTOMER_PATTERNS.UPDATE, updateUserDto))

      return user;
    }catch(e)
    {
      throw e
    }
  }

  async remove(id: string): Promise<User> {
    try
    {
      let user = this.userModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
      this.orderClient.emit(CUSTOMER_PATTERNS.REMOVE, id)
      return user
    }catch(e)
    {
      await this.cancelRemove(id)
      throw new RpcException("Failed to delete")
    }
  }

  async cancelCreation(id : string)
  {
    await this.userModel.findByIdAndDelete(new Types.ObjectId(id))
    this.authClient.emit<any, string>(AUTH_PATTERNS.CANCEL_REGISTER, id);
  }

  async cancelUpdate(id : string)
  {
    let user : User = await this.redisService.get(id);
    if(user)
    {
      let obj: UserDto = new UserDto()
      obj.email = user.email
      obj.name = user.name
      obj.phone = user.phone
      await this.userModel.findByIdAndUpdate(new Types.ObjectId(id), obj,{new : true})
      //await this.redisService.del(id);

    }
    this.authClient.emit<any, string>(AUTH_PATTERNS.CANCEL_UPDATE, id);
    console.log("hello")
  }

  async cancelRemove(id : string)
  {
    let user : User = await this.redisService.get(id)
    if(user)
    {
      user._id = new Types.ObjectId(id)
      await this.userModel.create(user)
      await this.redisService.del(id)
    }

    this.authClient.emit<any, string>(AUTH_PATTERNS.CANCEL_REMOVE, id);
  }

}