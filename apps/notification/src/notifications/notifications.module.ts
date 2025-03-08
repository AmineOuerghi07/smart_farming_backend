// apps/notification/src/notifications/notifications.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { RegionsModule } from 'apps/land-service/src/regions/regions.module';

@Module({
  imports: [forwardRef(() => RegionsModule)], // Import RegionsModule to share RegionsService
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // Export gateway for RegionsService
})
export class NotificationsModule {}