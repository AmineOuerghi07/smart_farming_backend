import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './costumer.service';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @MessagePattern('createCustomer')
  async create(@Payload() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @MessagePattern('findAllCustomers')
  async findAll() {
    return await this.customerService.findAll();
  }

  @MessagePattern('findOneCustomer')
  async findOne(@Payload() id: string) {
    return await this.customerService.findOne(id);
  }

  @MessagePattern('updateCustomer')
  async update(@Payload() payload: { id: string; updateCustomerDto: UpdateCustomerDto }) {
    return await this.customerService.update(payload.id, payload.updateCustomerDto);
  }

  @MessagePattern('removeCustomer')
  async remove(@Payload() id: string) {
    return await this.customerService.remove(id);
  }
}
