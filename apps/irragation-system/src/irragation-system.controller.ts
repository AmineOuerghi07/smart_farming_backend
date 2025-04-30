import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { IrrigationSystemService } from './irragation-system.service';
import { IRRIGATION_PATTERNS } from '@app/contracts/irrigation-system/irrigation-system.patterns';

@Controller('irrigation-system')
export class IrrigationSystemController {
  constructor(private readonly irrigationSystemService: IrrigationSystemService) {}

  @MessagePattern(IRRIGATION_PATTERNS.GET_SYSTEM_STATUS)
  async getSystemStatus() {
    try {
      const status = await this.irrigationSystemService.getSystemStatus();
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @EventPattern(IRRIGATION_PATTERNS.SET_PUMP_STATE)
  async handleSetPumpState(data: any) {
    try {
      console.log('Received SET_PUMP_STATE event:', data);
      
      // Extract pump state from different message formats
      let pumpState: boolean;
      
      if (data.pump_control) {
        // Command format: { pump_control: 'ON'/'OFF' }
        pumpState = data.pump_control === 'ON';
      } else if (data.state !== undefined) {
        // Direct boolean format: { state: true/false }
        pumpState = data.state;
      } else {
        console.error('Invalid pump control message format:', data);
        return;
      }
      
      console.log(`Extracted pump state: ${pumpState ? 'ON' : 'OFF'}`);
      await this.irrigationSystemService.setPumpState(pumpState);
      console.log('Pump state set successfully');
    } catch (error) {
      console.error('Failed to handle SET_PUMP_STATE event:', error);
    }
  }

  @EventPattern(IRRIGATION_PATTERNS.SET_OPERATION_MODE)
  async setOperationMode({ mode }: { mode: 'AUTOMATIC' | 'MANUAL' }) {
    try {
      await this.irrigationSystemService.setOperationMode(mode);
    } catch (error) {
      console.error(`Failed to set operation mode: ${error.message}`);
    }
  }

  @EventPattern(IRRIGATION_PATTERNS.SET_TEMPERATURE_SENSOR)
  async setTemperatureSensor({ enabled }: { enabled: boolean }) {
    try {
      await this.irrigationSystemService.setTemperatureSensor(enabled);
    } catch (error) {
      console.error(`Failed to set temperature sensor: ${error.message}`);
    }
  }

  @EventPattern(IRRIGATION_PATTERNS.UPDATE_SYSTEM_CONFIG)
  async updateSystemConfig({ config }: { 
    config: {
      dht_read_interval?: number;
      soil_check_interval?: number;
      pump_refresh_interval?: number;
    }
  }) {
    try {
      await this.irrigationSystemService.updateSystemConfig(config);
    } catch (error) {
      console.error(`Failed to update system config: ${error.message}`);
    }
  }

  @MessagePattern(IRRIGATION_PATTERNS.DISCOVER_DEVICES)
  async discoverDevices() {
    try {
      const devices = await this.irrigationSystemService.discoverDevices();
      return { success: true, data: devices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(IRRIGATION_PATTERNS.SEND_COMMAND)
  async sendCommand({ rpiId, command }: { rpiId: string; command: { pump_control?: string; mode?: string } }) {
    try {
      const result = await this.irrigationSystemService.sendCommand(rpiId, command);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(IRRIGATION_PATTERNS.GET_DEVICE_STATUS)
  async getDeviceStatus(rpiId: string) {
    try {
      const status = await this.irrigationSystemService.getDeviceStatus(rpiId);
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(IRRIGATION_PATTERNS.DISCOVER_DEVICES_BY_IP)
  async findDeviceByIp({ ipAddress }: { ipAddress: string }) {
    try {
      const device = await this.irrigationSystemService.findDeviceByIp(ipAddress);
      return { success: true, data: device };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(IRRIGATION_PATTERNS.REGISTER_DEVICE_QUEUES)
  async registerDeviceQueues({ rpiId, queueInfo }: { rpiId: string; queueInfo: { commandQueue: string; statusQueue: string } }) {
    try {
      const result = await this.irrigationSystemService.registerDeviceQueues(rpiId, queueInfo.commandQueue, queueInfo.statusQueue);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // HTTP endpoints for testing
  @Get('discover')
  async discoverDevicesHttp() {
    return this.irrigationSystemService.discoverDevices();
  }

  @Post(':rpiId/command')
  async sendCommandHttp(
    @Param('rpiId') rpiId: string,
    @Body() command: { pump_control?: string; mode?: string },
  ) {
    return this.irrigationSystemService.sendCommand(rpiId, command);
  }

  @Get(':rpiId/status')
  async getDeviceStatusHttp(@Param('rpiId') rpiId: string) {
    return this.irrigationSystemService.getDeviceStatus(rpiId);
  }

  @Get('discover-by-ip/:ipAddress')
  async discoverDeviceByIp(@Param('ipAddress') ipAddress: string) {
    return this.irrigationSystemService.findDeviceByIp(ipAddress);
  }

  @Post('ip/:ipAddress/command')
  async sendCommandByIp(
    @Param('ipAddress') ipAddress: string,
    @Body() command: { pump_control?: string; mode?: string },
  ) {
    // Trouve d'abord le périphérique par IP
    const device = await this.irrigationSystemService.findDeviceByIp(ipAddress);
    // Puis envoie la commande en utilisant son ID
    return this.irrigationSystemService.sendCommand(device.id, command);
  }

  @Post(':rpiId/register-queues')
  async sendregisterDeviceQueues(
    @Param('rpiId') rpiId: string,
    @Body() queueInfo: { commandQueue: string; statusQueue: string },
  ) {
    return this.irrigationSystemService.registerDeviceQueues(
      rpiId,
      queueInfo.commandQueue,
      queueInfo.statusQueue
    );
  }

  @Post('ip/:ipAddress/register-queues')
  async registerDeviceQueuesByIp(
    @Param('ipAddress') ipAddress: string,
    @Body() queueInfo: { commandQueue: string; statusQueue: string },
  ) {
    // Trouve d'abord le périphérique par IP
    const device = await this.irrigationSystemService.findDeviceByIp(ipAddress);
    // Puis enregistre les queues en utilisant son ID
    return this.irrigationSystemService.registerDeviceQueues(device.id, queueInfo.commandQueue, queueInfo.statusQueue);
  }
}