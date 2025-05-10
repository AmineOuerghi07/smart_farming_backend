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
    try {
      console.log('Requesting system status...');
      
      const response = await lastValueFrom(
        this.client.send(IRRIGATION_PATTERNS.GET_SYSTEM_STATUS, {}).pipe(
          timeout(5000),
          catchError(error => {
            console.error('Error getting system status:', error);
            throw new Error(`Failed to get system status: ${error.message}`);
          })
        )
      );
      
      console.log('Received raw system status response:', JSON.stringify(response));
      
      // Convert the entire response to a string and search for humidity patterns
      const responseStr = JSON.stringify(response);
      console.log('Searching for humidity in raw response string');
      
      // Extract humidity using regex from the raw response string
      const humidityRegex = /"humidity"\s*:\s*([0-9.]+)/;
      const humidityMatch = responseStr.match(humidityRegex);
      let extractedHumidity = null;
      
      if (humidityMatch && humidityMatch[1]) {
        extractedHumidity = parseFloat(humidityMatch[1]);
        console.log(`Successfully extracted humidity from raw response: ${extractedHumidity}`);
      }
      
      // Parse the response to ensure temperature is properly extracted
      const data = response.data || response;
      
      // Log the temperature and humidity specifically
      if (data) {
        console.log('Temperature from response:', data.temperature);
        console.log('Humidity from response:', data.humidity);
        
        if (data.status) {
          console.log('Temperature from status:', data.status.temperature);
          console.log('Humidity from status:', data.status.humidity);
        }
      }
      
      // Check if we need to normalize the response to include temperature and humidity
      if (data) {
        // First handle temperature
        if ((!data.temperature || data.temperature === 0) && 
            data.status && data.status.temperature && data.status.temperature > 0) {
          console.log('Normalizing response to include temperature from status');
          data.temperature = data.status.temperature;
        }

        // Now handle humidity - ensure humidity is always included
        if (!data.humidity || data.humidity === 0) {
          // Try to get humidity from status
          if (data.status && data.status.humidity) {
            console.log('Adding humidity from status:', data.status.humidity);
            data.humidity = data.status.humidity;
          } 
          // If extracted from raw response, use that
          else if (extractedHumidity) {
            console.log(`Setting humidity from extracted value: ${extractedHumidity}`);
            data.humidity = extractedHumidity;
            // Also add to status object if it exists
            if (data.status) {
              data.status.humidity = extractedHumidity;
            }
          }
        }
        
        // Now ensure status has humidity
        if (data.status && (!data.status.humidity || data.status.humidity === 0)) {
          if (data.humidity) {
            console.log('Adding humidity to status object:', data.humidity);
            data.status.humidity = data.humidity;
          } else if (extractedHumidity) {
            console.log(`Setting status.humidity from extracted value: ${extractedHumidity}`);
            data.status.humidity = extractedHumidity;
          }
        }
      }
      
      console.log('Processed system status response:', JSON.stringify(data));
      
      // Return the processed response
      return response;
    } catch (error) {
      console.error('Error in getSystemStatus:', error);
      throw new Error(`Failed to get system status: ${error.message}`);
    }
  }

  async setPumpState(state: boolean) {
    try {
      console.log('Attempting to set pump state:', state);
      
      const command = { 
        target_id: 'simulated-pi1',
        pump_control: state ? 'ON' : 'OFF',
        mode: state ? 'MANUAL' : undefined,
        force_manual_mode: state ? true : false,
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
          return { 
            success: true, 
            message: `Pump state set to ${state ? 'ON' : 'OFF'}${state ? ' and switched to manual mode' : ''}` 
          };
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

  async setVentilatorState(state: boolean) {
    try {
      console.log('Setting ventilator state:', state);
      
      const command = { 
        target_id: 'simulated-pi1',
        ventilator_control: state ? 'ON' : 'OFF',
        timestamp: Date.now() / 1000
      };

      console.log('Publishing ventilator command:', command);
      
      await this.client.emit(
        IRRIGATION_PATTERNS.CUSTOM_COMMAND, 
        command
      );
      
      return { 
        success: true, 
        message: `Ventilator state set to ${state ? 'ON' : 'OFF'}` 
      };
    } catch (error) {
      console.error('Error setting ventilator state:', error);
      throw new Error(`Failed to set ventilator state: ${error.message}`);
    }
  }

  async getVentilatorStatus() {
    try {
      console.log('Getting ventilator status...');
      
      // First get the system status which includes ventilator info
      const statusResponse = await this.getSystemStatus();
      
      console.log('Using system status for ventilator:', JSON.stringify(statusResponse));
      
      // Extract ventilator-specific information
      const data = statusResponse.data || statusResponse;
      
      const ventilatorOn = 
        data?.ventilator_on !== undefined ? data.ventilator_on :
        data?.status?.ventilator_on !== undefined ? data.status.ventilator_on :
        data?.data?.ventilator_on !== undefined ? data.data.ventilator_on :
        false;
        
      const ventilatorAuto = 
        data?.ventilator_auto !== undefined ? data.ventilator_auto :
        data?.status?.ventilator_auto !== undefined ? data.status.ventilator_auto :
        data?.data?.ventilator_auto !== undefined ? data.data.ventilator_auto :
        true;
        
      const ventilatorCycling = 
        data?.ventilator_cycling !== undefined ? data.ventilator_cycling :
        data?.status?.ventilator_cycling !== undefined ? data.status.ventilator_cycling :
        data?.data?.ventilator_cycling !== undefined ? data.data.ventilator_cycling :
        false;
        
      const temperature = 
        data?.status?.temperature !== undefined ? data.status.temperature :
        data?.temperature !== undefined ? data.temperature :
        data?.data?.temperature !== undefined ? data.data.temperature :
        data?.data?.status?.temperature !== undefined ? data.data.status.temperature :
        null;
        
      console.log('Extracted ventilator data:', {
        ventilatorOn,
        ventilatorAuto,
        ventilatorCycling,
        temperature
      });
      
      return {
        success: true,
        data: {
          ventilator_on: ventilatorOn,
          ventilator_auto: ventilatorAuto,
          ventilator_cycling: ventilatorCycling,
          temperature: temperature,
          timestamp: Date.now() / 1000
        }
      };
    } catch (error) {
      console.error('Error getting ventilator status:', error);
      throw new Error(`Failed to get ventilator status: ${error.message}`);
    }
  }

  async setLedState(state: boolean) {
    try {
      console.log('Setting LED state:', state);
      
      const command = { 
        target_id: 'simulated-pi1',
        led_control: state ? 'ON' : 'OFF',
        timestamp: Date.now() / 1000
      };

      console.log('Publishing LED command:', command);
      
      await this.client.emit(
        IRRIGATION_PATTERNS.CUSTOM_COMMAND, 
        command
      );
      
      return { 
        success: true, 
        message: `LED state set to ${state ? 'ON' : 'OFF'}` 
      };
    } catch (error) {
      console.error('Error setting LED state:', error);
      throw new Error(`Failed to set LED state: ${error.message}`);
    }
  }

  async getLightStatus() {
    try {
      console.log('Getting light sensor status...');
      
      // First get the system status which includes light sensor info
      const statusResponse = await this.getSystemStatus();
      
      console.log('Using system status for light sensor:', JSON.stringify(statusResponse));
      
      // Extract light-specific information
      const data = statusResponse.data || statusResponse;
      
      const lightDetected = 
        data?.light_detected !== undefined ? data.light_detected :
        data?.status?.light_detected !== undefined ? data.status.light_detected :
        data?.data?.light_detected !== undefined ? data.data.light_detected :
        false;
        
      const ledActive = 
        data?.led_active !== undefined ? data.led_active :
        data?.status?.led_active !== undefined ? data.status.led_active :
        data?.data?.led_active !== undefined ? data.data.led_active :
        false;
        
      console.log('Extracted light sensor data:', {
        lightDetected,
        ledActive
      });
      
      return {
        success: true,
        data: {
          light_detected: lightDetected,
          led_active: ledActive,
          timestamp: Date.now() / 1000,
          note: "LED uses inverted logic: ON when dark, OFF when light detected"
        }
      };
    } catch (error) {
      console.error('Error getting light status:', error);
      throw new Error(`Failed to get light status: ${error.message}`);
    }
  }
}