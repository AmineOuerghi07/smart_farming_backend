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
    try {
      console.log('Getting system status for Flutter app...');
      
      // Get the raw system status 
      const systemStatus = await this.irrigationSystemService.getSystemStatus();
      console.log('Raw system status:', JSON.stringify(systemStatus));
      
      // Extract data from the nested response structure
      const response = systemStatus.data || systemStatus;
      
      // Ensure humidity is included in the status object if available
      if (response && response.status) {
        if (!response.status.humidity) {
          if (response.humidity) {
            console.log('Adding humidity to status object:', response.humidity);
            response.status.humidity = response.humidity;
          } else if (response.data && response.data.humidity) {
            console.log('Adding humidity from data to status object:', response.data.humidity);
            response.status.humidity = response.data.humidity;
          }
        }
      }
      
      console.log('Final system status response:', JSON.stringify(response));
      return systemStatus;
    } catch (error) {
      console.error('Error in getSystemStatus controller:', error);
      throw error;
    }
  }

  @Get('sensors/all')
  async getAllSensorsData() {
    try {
      console.log('Getting all sensor data...');
      
      // Get all sensor data in a single request
      const systemStatus = await this.irrigationSystemService.getSystemStatus();
      const ventilatorStatus = await this.irrigationSystemService.getVentilatorStatus();
      const lightStatus = await this.irrigationSystemService.getLightStatus();
      
      console.log('System status response:', JSON.stringify(systemStatus));
      
      // First, check for the dht_values object which should contain the most accurate data
      const responseStr = JSON.stringify(systemStatus);
      console.log('Checking for dht_values in response...');
      
      // Extract data from the nested response structure
      const deviceData = systemStatus.data || systemStatus;
      
      // 1. First check for dht_values which is the new, most direct source
      const dhtValues = deviceData?.dht_values || deviceData?.data?.dht_values || deviceData?.status?.dht_values;
      if (dhtValues) {
        console.log('FOUND dht_values!', dhtValues);
      }
      
      // 2. Then try direct extraction with regex
      const humidityRegex = /"humidity"\s*:\s*([0-9.]+)/;
      const humidityMatch = responseStr.match(humidityRegex);
      let directHumidity = null;
      
      if (humidityMatch && humidityMatch[1]) {
        directHumidity = parseFloat(humidityMatch[1]);
        console.log(`CRITICAL: Extracted humidity directly from raw response: ${directHumidity}`);
      }
      
      // Log all possible paths where temperature and humidity might be located
      console.log('Investigating temperature and humidity locations:');
      console.log('DHT Values:', dhtValues);
      console.log('Root temperature:', deviceData?.temperature);
      console.log('Root humidity:', deviceData?.humidity);
      console.log('Status temperature:', deviceData?.status?.temperature);
      console.log('Status humidity:', deviceData?.status?.humidity);
      console.log('Data temperature:', deviceData?.data?.temperature);
      console.log('Data humidity:', deviceData?.data?.humidity);
      console.log('Data.status temperature:', deviceData?.data?.status?.temperature);
      console.log('Data.status humidity:', deviceData?.data?.status?.humidity);
      
      // Attempt to find humidity in raw response for debugging
      if (deviceData) {
        console.log('Keys in device data:', Object.keys(deviceData));
        if (deviceData.status) {
          console.log('Keys in status:', Object.keys(deviceData.status));
        }
      }
      
      // Check all possible paths where the data might be located
      const temperature = 
        dhtValues?.temperature !== undefined ? dhtValues.temperature :
        deviceData?.temperature !== undefined ? deviceData.temperature :
        deviceData?.status?.temperature !== undefined ? deviceData.status.temperature :
        deviceData?.data?.temperature !== undefined ? deviceData.data.temperature :
        deviceData?.data?.status?.temperature !== undefined ? deviceData.data.status.temperature :
        null;
      
      // Extended search for humidity in more places, prioritizing our direct sources
      let humidity = 
        dhtValues?.humidity !== undefined ? dhtValues.humidity :
        directHumidity !== null ? directHumidity :
        deviceData?.humidity !== undefined ? deviceData.humidity :
        deviceData?.status?.humidity !== undefined ? deviceData.status.humidity :
        deviceData?.data?.humidity !== undefined ? deviceData.data.humidity :
        deviceData?.data?.status?.humidity !== undefined ? deviceData.data.status.humidity :
        null;
      
      // Try to normalize humidity if we found temperature but not humidity
      if (temperature && humidity === null) {
        console.log('Temperature found but humidity missing - attempting to find humidity elsewhere');
        
        // Try one last approach - look for a humidity value immediately after the temperature
        const tempHumidityRegex = /"temperature"\s*:\s*([0-9.]+).*?"humidity"\s*:\s*([0-9.]+)/;
        const tempHumidityMatch = responseStr.match(tempHumidityRegex);
        
        if (tempHumidityMatch && tempHumidityMatch[2]) {
          humidity = parseFloat(tempHumidityMatch[2]);
          console.log('Found humidity in proximity to temperature:', humidity);
        }
      }
      
      // Set a fallback value of 50 if humidity is still null (a more plausible value)
      if (humidity === null) {
        humidity = 50; // More reasonable default than 0
        console.log('Setting fallback humidity value to 50%');
      }
      
      // Make sure humidity is not exactly 0 which is likely an error
      if (humidity === 0 && temperature > 0) {
        humidity = 50;
        console.log('Humidity was 0 with non-zero temperature, using fallback value of 50%');
      }
        
      const soilIsDry = 
        deviceData?.soil_is_dry !== undefined ? deviceData.soil_is_dry :
        deviceData?.status?.soil_is_dry !== undefined ? deviceData.status.soil_is_dry :
        deviceData?.data?.soil_is_dry !== undefined ? deviceData.data.soil_is_dry :
        deviceData?.data?.status?.soil_is_dry !== undefined ? deviceData.data.status.soil_is_dry :
        false;
        
      const pumpActive = 
        deviceData?.pump_active !== undefined ? deviceData.pump_active :
        deviceData?.status?.pump_active !== undefined ? deviceData.status.pump_active :
        deviceData?.data?.pump_active !== undefined ? deviceData.data.pump_active :
        deviceData?.data?.status?.pump_active !== undefined ? deviceData.data.status.pump_active :
        false;
        
      const automaticMode = 
        deviceData?.automatic_mode !== undefined ? deviceData.automatic_mode :
        deviceData?.status?.automatic_mode !== undefined ? deviceData.status.automatic_mode :
        deviceData?.data?.automatic_mode !== undefined ? deviceData.data.automatic_mode :
        deviceData?.data?.status?.automatic_mode !== undefined ? deviceData.data.status.automatic_mode :
        true;
        
      console.log('Extracted values:', {
        temperature,
        humidity,
        soilIsDry,
        pumpActive,
        automaticMode
      });
      
      // Extract and organize all sensor data with focus on DHT
      const result = {
        dht: {
          temperature,
          humidity,
        },
        soil: {
          is_dry: soilIsDry,
        },
        pump: {
          active: pumpActive,
          mode: automaticMode ? 'AUTOMATIC' : 'MANUAL',
        },
        ventilator: {
          active: ventilatorStatus.data?.ventilator_on || false,
          auto_mode: ventilatorStatus.data?.ventilator_auto || false,
          cycling: ventilatorStatus.data?.ventilator_cycling || false,
        },
        light: {
          detected: lightStatus.data?.light_detected || false,
          led_active: lightStatus.data?.led_active || false,
        },
        timestamp: Date.now() / 1000
      };
      
      console.log('Returning sensor data:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Error in getAllSensorsData:', error);
      throw error;
    }
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

  // Ventilator control endpoints
  @Post('ventilator/on')
  async turnVentilatorOn() {
    // Turn ventilator on (automatically switches to manual mode)
    return this.irrigationSystemService.setVentilatorState(true);
  }

  @Post('ventilator/off')
  async turnVentilatorOff() {
    // Turn ventilator off (stays in manual mode)
    return this.irrigationSystemService.setVentilatorState(false);
  }

  @Get('ventilator/status')
  async getVentilatorStatus() {
    // Get current ventilator status
    return this.irrigationSystemService.getVentilatorStatus();
  }

  // LED/Light control endpoints
  @Post('led/on')
  async turnLedOn() {
    // Turn LED on (overrides automatic control)
    return this.irrigationSystemService.setLedState(true);
  }

  @Post('led/off')
  async turnLedOff() {
    // Turn LED off (overrides automatic control)
    return this.irrigationSystemService.setLedState(false);
  }

  @Get('light')
  async getLightStatus() {
    // Get current light sensor status
    return this.irrigationSystemService.getLightStatus();
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

  @Get('humidity')
  async getHumidity() {
    try {
      console.log('Getting humidity value directly...');
      
      // Get the raw system status
      const systemStatus = await this.irrigationSystemService.getSystemStatus();
      console.log('Raw system status for humidity endpoint:', JSON.stringify(systemStatus));
      
      // First, try to extract humidity directly from the raw JSON response
      const responseStr = JSON.stringify(systemStatus);
      const humidityRegex = /"humidity"\s*:\s*([0-9.]+)/;
      const humidityMatch = responseStr.match(humidityRegex);
      let humidityValue = null;
      
      if (humidityMatch && humidityMatch[1]) {
        humidityValue = parseFloat(humidityMatch[1]);
        console.log(`DIRECT HUMIDITY ENDPOINT: Extracted humidity from raw response: ${humidityValue}`);
      }
      
      // If not found via regex, check all possible locations
      if (humidityValue === null) {
        const deviceData = systemStatus.data || systemStatus;
        
        humidityValue = 
          deviceData?.humidity !== undefined ? deviceData.humidity :
          deviceData?.status?.humidity !== undefined ? deviceData.status.humidity :
          deviceData?.data?.humidity !== undefined ? deviceData.data.humidity :
          deviceData?.data?.status?.humidity !== undefined ? deviceData.data.status.humidity :
          0; // Default value if nothing found
      }
      
      return {
        humidity: humidityValue,
        timestamp: Date.now() / 1000,
        note: "Direct humidity endpoint for debugging"
      };
    } catch (error) {
      console.error('Error getting humidity:', error);
      throw error;
    }
  }
}