import { Module } from '@nestjs/common';
import { NotificationController } from './notifications/notification.controller';
import { NotificationService } from './notifications/notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/smart-farming'),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
