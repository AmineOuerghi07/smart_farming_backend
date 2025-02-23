import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schema/customerSchema';
import { CustomerService } from './costumer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema }
    ])
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule { }
