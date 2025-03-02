import { NestFactory } from '@nestjs/core';
import { SmartFarmingApiGatewayModule } from './smart-farming-api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(SmartFarmingApiGatewayModule);
  //app.setGlobalPrefix('/api')
  await app.listen(3000);
}
bootstrap();
