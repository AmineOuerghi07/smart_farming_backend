import { NestFactory } from '@nestjs/core';
import { BlockchainAppModule} from './blockchain-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomRpcExceptionFilter } from '@app/contracts/errors/filters/rpc.exception.filter';
import { BLOCKCHAIN_QUEUE } from '@app/contracts/blockchain/blockchain.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      BlockchainAppModule,
      {
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: BLOCKCHAIN_QUEUE,
          queueOptions: {
            durable: false,
          },
        }
      }
    );
    
    app.useGlobalFilters(new CustomRpcExceptionFilter());
  
    await app.listen();
  }
bootstrap();
