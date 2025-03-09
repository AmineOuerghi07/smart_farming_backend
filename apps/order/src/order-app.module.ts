import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from './order/order.module';
import { CustumerModule } from './custumer/custumer.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_NAME,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: ORDER_NAME,
        },
      },
    ])
    , MongooseModule.forRoot('mongodb://localhost/orders'), OrderModule, CustumerModule,
   

      OrderModule,
      CustumerModule
  ],
  controllers: [],
  providers: [],
})
export class OrderAppModule { }
