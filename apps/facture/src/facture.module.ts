import { Module } from '@nestjs/common';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';
import { FactureModule } from './facture/facture.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FACTURE_NAME, FACTURE_QUEUE } from '@app/contracts/facture/facture.rmq';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FACTURE_NAME,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: FACTURE_QUEUE,
        },
      }
    ]),
     
    
    FactureModule,
    MongooseModule.forRoot(process.env.DATABASE_URL ?? 'mongodb://localhost/facture'),
    CustomerModule,
    ProductModule
  ],
  controllers: [FactureController],
  providers: [FactureService],
})
export class FactureAppModule {}