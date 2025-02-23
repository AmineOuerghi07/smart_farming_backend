import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schema/customerSchema';
import { Model } from 'mongoose';
@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) { }

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const newCustomer = new this.customerModel(createCustomerDto);
      return await newCustomer.save();
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async findAll() {
    return await this.customerModel.find();
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const updatedCustomer = await this.customerModel.findByIdAndUpdate(id, updateCustomerDto, {
      new: true, // Return updated document
      runValidators: true,
    });

    if (!updatedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return updatedCustomer;
  }

  async remove(id: string) {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(id);
    if (!deletedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return { message: 'Customer deleted successfully' };
  }
}