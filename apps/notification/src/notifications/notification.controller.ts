import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NOTIFICATION_EVENTS } from '@app/contracts/notification/notification.events';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(NOTIFICATION_EVENTS.SYSTEM_NOTIFICATION)
  async handleSystemNotification(data: any) {
    return this.notificationService.create(data);
  }

  @MessagePattern(NOTIFICATION_EVENTS.CREATE_NOTIFICATION)
  async create(data: any) {
    return this.notificationService.create(data);
  }

  @MessagePattern(NOTIFICATION_EVENTS.GET_ALL_NOTIFICATIONS)
  async findAll(userId: string) {
    return this.notificationService.findAll(userId);
  }

  @MessagePattern(NOTIFICATION_EVENTS.GET_NOTIFICATION)
  async findOne(id: string) {
    return this.notificationService.findOne(id);
  }

  @MessagePattern(NOTIFICATION_EVENTS.MARK_AS_READ)
  async markAsRead(id: string) {
    return this.notificationService.markAsRead(id);
  }

  @MessagePattern(NOTIFICATION_EVENTS.MARK_ALL_AS_READ)
  async markAllAsRead(userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @MessagePattern(NOTIFICATION_EVENTS.DELETE_NOTIFICATION)
  async delete(id: string) {
    return this.notificationService.delete(id);
  }
} 