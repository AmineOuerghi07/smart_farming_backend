// // apps/notification/src/notifications/notifications.service.ts
// import { Injectable } from '@nestjs/common';
// import { NotificationsGateway } from './notifications.gateway';
// import { OnEvent } from '@nestjs/event-emitter';
// import { SensorsService } from 'apps/land-service/src/sensors/sensors.service';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     private readonly notificationsGateway: NotificationsGateway,
//     private readonly sensorsService: SensorsService // Inject SensorsService
//   ) {}

//   @OnEvent('sensor_alert')
//   handleSensorAlert(payload: { sensorId: string; message: string; userId?: string }) {
//     // If userId is not provided in the payload, we need to fetch it (e.g., from the region/land)
//     const targetUserId = payload.userId || 'defaultUser'; // Adjust logic to fetch userId if needed
//     this.notificationsGateway.sendUserNotification(targetUserId, payload.message);
//   }

//   async emitAllSensorsData() {
//     const sensorsData = await this.sensorsService.findAll();
//     this.notificationsGateway.emitSensorsData(sensorsData);
//   }
// }