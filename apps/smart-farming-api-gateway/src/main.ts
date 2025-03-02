import { NestFactory } from '@nestjs/core';
import { SmartFarmingApiGatewayModule } from './smart-farming-api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(SmartFarmingApiGatewayModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
