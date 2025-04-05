import { NestFactory } from '@nestjs/core';
import { SensorServiceModule } from './sensor-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SENSORS_QUEUE } from '@app/contracts/sensor/sensors.rmq';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SensorServiceModule, 
    {
              transport: Transport.RMQ,
              options: {
                urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
                queue: SENSORS_QUEUE,
                queueOptions: {
                  durable: false
                },
              },
        }
    
  );
  await app.listen();
}
bootstrap();
