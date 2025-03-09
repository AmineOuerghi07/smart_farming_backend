import { NestFactory } from '@nestjs/core';
import { FactureAppModule } from './facture.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FACTURE_QUEUE } from '@app/contracts/facture/facture.rmq';
import { CustomRpcExceptionFilter } from '@app/contracts/errors/filters/rpc.exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FactureAppModule, {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: FACTURE_QUEUE,
        queueOptions: {
          durable: false
        },
      },
    });
  
    app.useGlobalFilters(new CustomRpcExceptionFilter());

    await app.listen();
}
bootstrap();
