import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './schema/customerSchema';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UserDto } from '@app/contracts/user/user.dto';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { RedisService } from '../cache/redis.cache.service';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';

@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>, @Inject(ORDER_NAME) private orderClient: ClientProxy, private redisService: RedisService) { }

  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      await this.redisService.set(createCustomerDto._id.toString(), createCustomerDto)
      createCustomerDto._id = new Types.ObjectId(createCustomerDto._id)
      return await this.customerModel.create(createCustomerDto);
    } catch (e) {
      this.cancelCreation(createCustomerDto._id.toString())
      throw e
    }
  }

  // Get all customers
  async findAll(): Promise<Customer[]> {
    return await this.customerModel.find();
  }

  // Get a single customer by ID
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new RpcException(`Customer with ID ${id} not found`);
    return customer;
  }

  // Update a customer by ID
  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    let updates: UserDto = new UserDto()

    updates.name = updateCustomerDto.name
    updates.email = updateCustomerDto.email
    updates.phone = updateCustomerDto.phone
    try {
      const customer: Customer = await this.customerModel.findById(new Types.ObjectId(id))
      if (!customer)
        throw new RpcException("User Not found")
      await this.redisService.set(id, customer)
      if(updates.phone.length < 8)
      {
        await this.cancelUpdate(id)
        throw new RpcException("Failed to update !!!")
      }

      const updatedCustomer = await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), updates, {
        new: true, // Return updated document
        });


      return updatedCustomer;
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  // Delete a customer by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!deletedCustomer) throw new RpcException(`Customer with ID ${id} not found`);
    return { message: `Customer with ID ${id} deleted successfully` };
  }

  async cancelCreation(id: string) {
    let user: Customer = await this.redisService.get(id)
    if (user) {
      await this.customerModel.findByIdAndDelete(new Types.ObjectId(id))
      await this.redisService.del(id)
    }
    this.orderClient.emit<any, string>(CUSTOMER_PATTERNS.CANCEL_CREATION, id)
  }

  async cancelUpdate(id: string) {
    let user: Customer = await this.redisService.get(id);
    if (user) {
      let obj: UserDto = new UserDto()
      obj.email = user.email
      obj.name = user.name
      obj.phone = user.phone
      await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), obj, { new: true })
      //await this.redisService.del(id);
    }
    this.orderClient.emit<any, string>(CUSTOMER_PATTERNS.CANCEL_UPDATE, id)
  }

  async cancelRemove(id: string) {
    let user: Customer = await this.redisService.get(id)
    if (user) {
      user._id = new Types.ObjectId(id)
      await this.customerModel.create(user)
      await this.redisService.del(id)
    }

    this.orderClient.emit<any, string>(CUSTOMER_PATTERNS.CANCEL_REMOVE, id)
  }
}
