// apps/notification/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();