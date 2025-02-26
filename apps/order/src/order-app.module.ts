import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from './order/order.module';
import { CustumerModule } from './custumer/custumer.module';
import { Customer, CustomerSchema } from './custumer/schema/customerSchema';
import { Order, OrderSchema } from './order/schemas/orderSchema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';


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
    CacheModule.registerAsync({  
            isGlobal: true,  
            useFactory: async () => ({  
              store: await redisStore({  
                socket: {  
                  host: 'localhost',  
                  port: 6379,  
                },        
              }),      
            }),    
      }), 

      OrderModule,
      CustumerModule
  ],
  controllers: [],
  providers: [],
})
export class OrderAppModule { }
