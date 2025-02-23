import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomerService } from './custumer.service';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { Customer_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';

@Controller()
export class CustumerController {
  constructor(private readonly custumerService: CustomerService) {}

  @MessagePattern(Customer_PATTERNS.CREATE)
  create(@Payload() createCustumerDto: CreateCustomerDto) {
    return this.custumerService.create(createCustumerDto);
  }

  @MessagePattern(Customer_PATTERNS.FIND_ALL)
  findAll() {
    return this.custumerService.findAll();
  }

  @MessagePattern(Customer_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.custumerService.findOne(id);
  }

  @MessagePattern(Customer_PATTERNS.UPDATE)
  update(@Payload() updateCustumerDto: UpdateCustomerDto) {
    return this.custumerService.update(updateCustumerDto.customerId, updateCustumerDto);
  }

  @MessagePattern(Customer_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.custumerService.remove(id);
  }
}
