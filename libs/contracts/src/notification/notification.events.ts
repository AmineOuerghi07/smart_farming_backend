export const NOTIFICATION_EVENTS = {
  // System events
  REGION_CREATED: 'region_created',
  REGION_UPDATED: 'region_updated',
  REGION_DELETED: 'region_deleted',
  SENSOR_ALERT: 'sensor_alert',
  WEATHER_ALERT: 'weather_alert',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',

  // API Gateway to Notification Service events
  CREATE_NOTIFICATION: 'CREATE_NOTIFICATION',
  GET_ALL_NOTIFICATIONS: 'GET_ALL_NOTIFICATIONS',
  GET_NOTIFICATION: 'GET_NOTIFICATION',
  GET_USER_NOTIFICATIONS: 'get_user_notifications',
  UPDATE_NOTIFICATION: 'update_notification',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
} as const; 