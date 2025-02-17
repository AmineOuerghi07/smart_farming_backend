import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from './order/order.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/orders'), OrderModule],
  controllers: [],
  providers: [],
})
export class OrderAppModule {}
