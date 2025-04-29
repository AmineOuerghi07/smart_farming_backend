import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IrrigationSystemService } from './irrigation-system.service';

@Controller('irrigation')
export class IrrigationSystemController {
  constructor(private readonly irrigationSystemService: IrrigationSystemService) {}

  @Get('discover')
  async discoverDevices() {
    return this.irrigationSystemService.discoverDevices();
  }

  @Get('status')
  async getSystemStatus() {
    return this.irrigationSystemService.getSystemStatus();
  }

  @Post('pump/on')
  async turnPumpOn() {
    // This will turn the pump on AND switch to manual mode automatically
    return this.irrigationSystemService.setPumpState(true);
  }

  @Post('pump/off')
  async turnPumpOff() {
    // This will turn the pump off but stay in current mode
    return this.irrigationSystemService.setPumpState(false);
  }

  @Post('mode/automatic')
  async setAutomaticMode() {
    // Switch to automatic mode where soil moisture sensor controls the pump
    return this.irrigationSystemService.setOperationMode('AUTOMATIC');
  }

  @Post('mode/manual')
  async setManualMode() {
    // Switch to manual mode where pump is only controlled by API calls
    return this.irrigationSystemService.setOperationMode('MANUAL');
  }

  @Post('temperature/enable')
  async enableTemperatureSensor() {
    return this.irrigationSystemService.setTemperatureSensor(true);
  }

  @Post('temperature/disable')
  async disableTemperatureSensor() {
    return this.irrigationSystemService.setTemperatureSensor(false);
  }

  @Post('config')
  async updateSystemConfig(@Body() config: {
    dht_read_interval?: number;
    soil_check_interval?: number;
    pump_refresh_interval?: number;
  }) {
    return this.irrigationSystemService.updateSystemConfig(config);
  }

  @Post(':rpiId/command')
  async sendCommand(
    @Param('rpiId') rpiId: string,
    @Body() command: { pump_control?: string; mode?: string },
  ) {
    return this.irrigationSystemService.sendCommand(rpiId, command);
  }

  @Get(':rpiId/status')
  async getDeviceStatus(@Param('rpiId') rpiId: string) {
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
    const device = await this.irrigationSystemService.findDeviceByIp(ipAddress);
    return this.irrigationSystemService.sendCommand(device.id, command);
  }
}