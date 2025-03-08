import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomerService } from './custumer.service';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';

@Controller()
export class CustumerController {
  constructor(private readonly custumerService: CustomerService) {}

  @EventPattern(CUSTOMER_PATTERNS.CREATE)
  create(@Payload() createCustumerDto: CreateCustomerDto) {
    return this.custumerService.create(createCustumerDto);
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ALL)
  findAll() {
    return this.custumerService.findAll();
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.custumerService.findOne(id);
  }

  @EventPattern(CUSTOMER_PATTERNS.UPDATE)
  update(@Payload() updateCustumerDto: UpdateCustomerDto) {
    return this.custumerService.update(updateCustumerDto._id.toString(), updateCustumerDto);
  }

  @EventPattern(CUSTOMER_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.custumerService.remove(id);
  }

  
}
