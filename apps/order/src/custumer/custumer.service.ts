import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schema/customerSchema';
import { Model, Types } from 'mongoose';
import { FACTURE_NAME } from '@app/contracts/facture/facture.rmq';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';
import { RpcException } from '@nestjs/microservices';
import { UserDto } from '@app/contracts/user/user.dto';
@Injectable()
export class CustomerService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>, @Inject(FACTURE_NAME) private factureClient) { }

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      createCustomerDto._id = new Types.ObjectId(createCustomerDto._id)
      
      await this.factureClient.emit(CUSTOMER_PATTERNS.CREATE, createCustomerDto)

      return await this.customerModel.create(createCustomerDto);
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

    let updates : UserDto = new UserDto()

    updates.name = updateCustomerDto.name
    updates.email = updateCustomerDto.email
    updates.phone = updateCustomerDto.phone

    const updatedCustomer = await this.customerModel.findByIdAndUpdate(new Types.ObjectId(id), updates, {
      new: true, // Return updated document
      runValidators: true,
    });

    if (!updatedCustomer) throw new RpcException(`Customer with ID ${id} not found`);

    this.factureClient.emit(CUSTOMER_PATTERNS.UPDATE, updateCustomerDto);

    return updatedCustomer;
  }

  async remove(id: string) {
    const deletedCustomer = await this.customerModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!deletedCustomer) throw new NotFoundException(`Customer with ID ${id} not found`);

    this.factureClient.emit(CUSTOMER_PATTERNS.REMOVE, id);

    return { message: 'Customer deleted successfully' };
  }
}