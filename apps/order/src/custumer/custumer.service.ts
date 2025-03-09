import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schema/customerSchema';
import { Model, Types } from 'mongoose';
import { FACTURE_NAME } from '@app/contracts/facture/facture.rmq';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UserDto } from '@app/contracts/user/user.dto';
import { lastValueFrom } from 'rxjs';
import { RedisService } from '../cache/redis.cache.service';
import { LAND_NAME } from '@app/contracts/land/land.rmq';
import { USER_PATTERNS } from '@app/contracts/land/user.patterns';
@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>, @Inject(FACTURE_NAME) private factureClient, private redisService : RedisService, @Inject(LAND_NAME) private landClient : ClientProxy) { }

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      createCustomerDto._id = new Types.ObjectId(createCustomerDto._id)

      await this.factureClient.emit(CUSTOMER_PATTERNS.CREATE, createCustomerDto)

      return await this.customerModel.create(createCustomerDto);
    } catch (error) {
      await this.cancelCreation(createCustomerDto._id.toString())
      throw new RpcException(`Failed to create customer: ${error.message}`);
    }
  }

  async findAll() {
    return await this.customerModel.find();
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new RpcException(`Customer with ID ${id} not found`);
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {

    let updates: UserDto = new UserDto()

    updates.name = updateCustomerDto.name
    updates.email = updateCustomerDto.email
    updates.phone = updateCustomerDto.phone
    try {
      const customer : Customer = await this.customerModel.findById(new Types.ObjectId(id))
      if(!customer)
        throw new RpcException("User Not found")
      await this.redisService.set(id, customer)
      const updatedCustomer = await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), updates, {
        new: true, // Return updated document
        runValidators: true,
      });

      await lastValueFrom(this.factureClient.send(CUSTOMER_PATTERNS.UPDATE, updateCustomerDto));

      return updatedCustomer;
    } catch (e) {
      throw e
    }
  }

  async remove(id: string) {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!deletedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);

    this.factureClient.emit(CUSTOMER_PATTERNS.REMOVE, id);

    return { message: 'Customer deleted successfully' };
  }


    async cancelCreation(id : string)
    {
      let user : Customer = await this.redisService.get(id)
      if(user)
      {
        await this.customerModel.findByIdAndDelete(new Types.ObjectId(id))
        await this.redisService.del(id)
      }
      this.landClient.emit<any, string>(USER_PATTERNS.USER_CANCEL_CREATION, id)
    }
  
    async cancelUpdate(id : string)
    {
      let user : Customer = await this.redisService.get(id);
      console.log(user)
      console.log("Hello")
      if(user)
      {
        let obj: UserDto = new UserDto()
        obj.email = user.email
        obj.name = user.name
        obj.phone = user.phone        
        await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), obj,{new : true})
        await this.redisService.del(id);
      }
      this.landClient.emit<any, string>(USER_PATTERNS.USER_CANCEL_UPDATE, id)
    }
  
    async cancelRemove(id : string)
    {
      let user : Customer = await this.redisService.get(id)
      if(user)
      {
        user._id =  new Types.ObjectId(id)
        await this.customerModel.create(user)
        await this.redisService.del(id)
      }

      this.landClient.emit<any, string>(USER_PATTERNS.USER_CANCEL_REMOVE, id)
    }
}