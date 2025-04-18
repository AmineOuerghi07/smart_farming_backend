import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCT_NAME, PRODUCT_QUEUE } from '@app/contracts/product/product.rmq';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: PRODUCT_NAME, transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: PRODUCT_QUEUE,
        },
      }
    ])
    , ProductModule, MongooseModule.forRoot(process.env.DATABASE_URL ?? 'mongodb://localhost/product'),
    
    ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductAppModule { }
