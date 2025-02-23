import { Module } from '@nestjs/common';

import { CustumerController } from './custumer.controller';
import { CustomerService } from './custumer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from './schema/customerSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }])],
  controllers: [CustumerController],
  providers: [CustomerService],
})
export class CustumerModule { }
