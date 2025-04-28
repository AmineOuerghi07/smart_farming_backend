import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IRRIGATION_SYSTEM_NAME } from '@app/contracts/irrigation-system/irrigation-system.rmq';
import { lastValueFrom, timeout, catchError } from 'rxjs';
import { IRRIGATION_PATTERNS } from '@app/contracts/irrigation-system/irrigation-system.patterns';

@Injectable()
export class IrrigationSystemService {
  constructor(@Inject(IRRIGATION_SYSTEM_NAME) private readonly client: ClientProxy) {}

  async discoverDevices() {
    return lastValueFrom(
      this.client.send(IRRIGATION_PATTERNS.DISCOVER_DEVICES, {}).pipe(
        timeout(5000),
        catchError(error => {
          throw new Error(`Failed to discover devices: ${error.message}`);
        })
      )
    );
  }

  async getSystemStatus() {
    return lastValueFrom(
      this.client.send(IRRIGATION_PATTERNS.GET_SYSTEM_STATUS, {}).pipe(
        timeout(5000),
        catchError(error => {
          throw new Error(`Failed to get system status: ${error.message}`);
        })
      )
    );
  }

  async setPumpState(state: boolean) {
    try {
      console.log('Attempting to set pump state:', state);
      
      const command = { 
        target_id: 'irrigation_system_1',
        pump_control: state ? 'ON' : 'OFF',
        timestamp: Date.now() / 1000
      };

      console.log('Publishing command:', {
        pattern: IRRIGATION_PATTERNS.SET_PUMP_STATE,
        command
      });
      
      // Set a longer timeout for allowing service initialization
      const timeoutMs = 10000; // 10 seconds
      
      // Send command through RabbitMQ with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let lastError = null;
      
      while (retryCount < maxRetries) {
        try {
          await lastValueFrom(
            this.client.emit(IRRIGATION_PATTERNS.SET_PUMP_STATE, command).pipe(
              timeout(timeoutMs),
              catchError(error => {
                lastError = error;
                throw new Error(`Failed to set pump state: ${error.message}`);
              })
            )
          );
          
          console.log('Pump command sent successfully');
          return { success: true, message: `Pump state set to ${state ? 'ON' : 'OFF'}` };
        } catch (error) {
          retryCount++;
          console.warn(`Attempt ${retryCount}/${maxRetries} failed: ${error.message}`);
          
          if (retryCount < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            // This was the last attempt
            lastError = error;
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError || new Error('Failed to set pump state after multiple attempts');
    } catch (error) {
      console.error('Error in setPumpState:', error);
      throw new Error(`Failed to set pump state: ${error.message}`);
    }
  }

  async setOperationMode(mode: 'AUTOMATIC' | 'MANUAL') {
    try {
      await this.client.emit(IRRIGATION_PATTERNS.SET_OPERATION_MODE, { mode });
      return { success: true, message: `Operation mode set to ${mode}` };
    } catch (error) {
      throw new Error(`Failed to set operation mode: ${error.message}`);
    }
  }

  async setTemperatureSensor(enabled: boolean) {
    try {
      await this.client.emit(IRRIGATION_PATTERNS.SET_TEMPERATURE_SENSOR, { enabled });
      return { success: true, message: `Temperature sensor ${enabled ? 'enabled' : 'disabled'}` };
    } catch (error) {
      throw new Error(`Failed to set temperature sensor: ${error.message}`);
    }
  }

  async updateSystemConfig(config: {
    dht_read_interval?: number;
    soil_check_interval?: number;
    pump_refresh_interval?: number;
  }) {
    try {
      await this.client.emit(IRRIGATION_PATTERNS.UPDATE_SYSTEM_CONFIG, { config });
      return { success: true, message: 'System configuration updated', config };
    } catch (error) {
      throw new Error(`Failed to update system config: ${error.message}`);
    }
  }

  async sendCommand(rpiId: string, command: { pump_control?: string; mode?: string }) {
    return lastValueFrom(
      this.client.send(IRRIGATION_PATTERNS.SEND_COMMAND, { rpiId, command }).pipe(
        timeout(5000),
        catchError(error => {
          throw new Error(`Failed to send command: ${error.message}`);
        })
      )
    );
  }

  async getDeviceStatus(rpiId: string) {
    return lastValueFrom(
      this.client.send(IRRIGATION_PATTERNS.GET_DEVICE_STATUS, rpiId).pipe(
        timeout(5000),
        catchError(error => {
          throw new Error(`Failed to get device status: ${error.message}`);
        })
      )
    );
  }

  async findDeviceByIp(ipAddress: string) {
    return lastValueFrom(
      this.client.send(IRRIGATION_PATTERNS.DISCOVER_DEVICES_BY_IP, { ipAddress }).pipe(
        timeout(5000),
        catchError(error => {
          throw new Error(`Failed to find device by IP: ${error.message}`);
        })
      )
    );
  }
}