import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './schema/customerSchema';
import { RpcException } from '@nestjs/microservices';
import { UserDto } from '@app/contracts/user/user.dto';

@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) {}

  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {

    createCustomerDto._id = new Types.ObjectId(createCustomerDto._id)
    return await this.customerModel.create(createCustomerDto);
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

    let updates : UserDto = new UserDto()

    updates.name = updateCustomerDto.name
    updates.email = updateCustomerDto.email
    updates.phone = updateCustomerDto.phone

    const updatedCustomer = await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), updates, { new: true });
    if (!updatedCustomer) throw new RpcException(`Customer with ID ${id} not found`);
    return updatedCustomer;
  }

  // Delete a customer by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!deletedCustomer) throw new RpcException(`Customer with ID ${id} not found`);
    return { message: `Customer with ID ${id} deleted successfully` };
  }
}
