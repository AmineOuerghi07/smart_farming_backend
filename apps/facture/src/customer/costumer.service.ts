import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './schema/customerSchema';

@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) {}

  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const newCustomer = new this.customerModel(createCustomerDto);
    return await newCustomer.save();
  }

  // Get all customers
  async findAll(): Promise<Customer[]> {
    return await this.customerModel.find();
  }

  // Get a single customer by ID
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  // Update a customer by ID
  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const updatedCustomer = await this.customerModel.findByIdAndUpdate(id, updateCustomerDto, { new: true });
    if (!updatedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return updatedCustomer;
  }

  // Delete a customer by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(id);
    if (!deletedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return { message: `Customer with ID ${id} deleted successfully` };
  }
}
