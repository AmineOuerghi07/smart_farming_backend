import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NOTIFICATION_EVENTS } from '@app/contracts/notification/notification.events';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(NOTIFICATION_EVENTS.SENSOR_ALERT)
  async handleSensorAlert(data: any) {
    this.logger.log(`Received sensor alert: ${JSON.stringify(data)}`);
    const notification = await this.notificationService.create(data);
    this.logger.log(`Created notification: ${JSON.stringify(notification)}`);
    return notification;
  }

  @MessagePattern(NOTIFICATION_EVENTS.SYSTEM_NOTIFICATION)
  async handleSystemNotification(data: any) {
    this.logger.log(`Received system notification: ${JSON.stringify(data)}`);
    const notification = await this.notificationService.create(data);
    this.logger.log(`Created notification: ${JSON.stringify(notification)}`);
    return notification;
  }

  @MessagePattern(NOTIFICATION_EVENTS.CREATE_NOTIFICATION)
  async create(data: any) {
    this.logger.log(`Received create notification request: ${JSON.stringify(data)}`);
    return this.notificationService.create(data);
  }

  @MessagePattern(NOTIFICATION_EVENTS.GET_ALL_NOTIFICATIONS)
  async findAll(userId: string) {
    this.logger.log(`Getting all notifications for user: ${userId}`);
    return this.notificationService.findAll(userId);
  }

  @MessagePattern(NOTIFICATION_EVENTS.GET_NOTIFICATION)
  async findOne(id: string) {
    this.logger.log(`Getting notification: ${id}`);
    return this.notificationService.findOne(id);
  }

  @MessagePattern(NOTIFICATION_EVENTS.MARK_AS_READ)
  async markAsRead(id: string) {
    this.logger.log(`Marking notification as read: ${id}`);
    return this.notificationService.markAsRead(id);
  }

  @MessagePattern(NOTIFICATION_EVENTS.MARK_ALL_AS_READ)
  async markAllAsRead(userId: string) {
    this.logger.log(`Marking all notifications as read for user: ${userId}`);
    return this.notificationService.markAllAsRead(userId);
  }

  @MessagePattern(NOTIFICATION_EVENTS.DELETE_NOTIFICATION)
  async delete(id: string) {
    this.logger.log(`Deleting notification: ${id}`);
    return this.notificationService.delete(id);
  }
} 