import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import * as mdns from 'mdns';
import { EventPattern } from '@nestjs/microservices';
import { IRRIGATION_PATTERNS } from '@app/contracts/irrigation-system/irrigation-system.patterns';

export interface DeviceStatus {
  soil_is_dry: boolean;
  pump_active: boolean;
  automatic_mode: boolean;
  last_watered: number | null;
  temperature: number | null;
  humidity: number | null;
}

export interface Device {
  id: string;
  name?: string;
  ip?: string;
  capabilities?: string[];
  components?: string[];
  queues?: { command: string; status: string };
  lastHeartbeat?: number;
  discoveryMethod: 'mdns' | 'rabbitmq' | 'manual';
  status?: DeviceStatus;
}

@Injectable()
export class IrrigationSystemService implements OnModuleInit, OnModuleDestroy {
  private devices: Map<string, Device> = new Map();
  
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private client: ClientProxy;
  private browser: any; // mdns browser

  constructor() {
    // Initialize RabbitMQ client for sending commands
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://smart_farming:password123@192.168.43.124:5672'],
        queue: 'irrigation_commands',
        queueOptions: { durable: true },
      },
    });
  }

  async onModuleInit() {
    // Initialize RabbitMQ connection
    await this.initializeRabbitMQ();
    await this.setupConsumers();
    
    // Initialize mDNS discovery
    this.setupMdnsDiscovery();
    
    // Wait a moment for device registration
    console.log('Waiting for device registration...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // If no devices registered, create a default one
    if (this.devices.size === 0) {
      console.log('No devices registered automatically, creating default device');
      this.registerDefaultDevice();
    }
    
    // Log status
    const deviceCount = this.devices.size;
    console.log(`Service initialized with ${deviceCount} registered devices`);
  }

  async onModuleDestroy() {
    // Clean up RabbitMQ connection
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    
    // Stop mDNS browser
    if (this.browser) this.browser.stop();
  }

  private setupMdnsDiscovery() {
    try {
      this.browser = mdns.createBrowser(mdns.tcp('irrigation'));
      
      this.browser.on('serviceUp', (service) => {
        const id = service.txtRecord.device_id || service.name;
        const components = service.txtRecord.components?.split(',') || [];
        const ip = service.addresses.find(addr => addr.includes('.')) || service.addresses[0];
        
        // Use standardized queue names based on device ID
        const commandQueue = `rpi.${id}.commands`;
        const statusQueue = `rpi.${id}.status`;
        
        // Store or update device in our map
        this.devices.set(id, { 
          id, 
          ip, 
          name: service.name,
          components,
          discoveryMethod: 'mdns',
          queues: {
            command: commandQueue,
            status: statusQueue
          }
        });
        
        console.log(`Discovered device via mDNS: ${id} at ${ip}`);
        
        // Bind to the status queue
        this.bindStatusQueue(id, statusQueue).catch(err => {
          console.error(`Failed to bind status queue for ${id}:`, err);
        });
      });
      
      this.browser.on('serviceDown', (service) => {
        const id = service.txtRecord.device_id || service.name;
        // Only remove if it was discovered via mDNS
        const device = this.devices.get(id);
        if (device && device.discoveryMethod === 'mdns') {
          this.devices.delete(id);
          console.log(`Device offline: ${id}`);
        }
      });
      
      this.browser.start();
      console.log('mDNS discovery started');
    } catch (error) {
      console.error('Failed to initialize mDNS discovery:', error);
    }
  }

  async initializeRabbitMQ() {
    try {
      this.connection = await amqp.connect('amqp://smart_farming:password123@192.168.43.124:5672');
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('irrigation', 'topic', { durable: true });
      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
    }
  }

  async setupConsumers() {
    try {
      // Consume device registration messages
      const registrationQueue = 'device_registration';
      await this.channel.assertQueue(registrationQueue, { durable: true });
      await this.channel.bindQueue(registrationQueue, 'irrigation', 'device.registration');
      this.channel.consume(registrationQueue, (msg) => {
        if (msg) {
          const message = JSON.parse(msg.content.toString());
          this.handleDeviceRegistration(message);
          this.channel.ack(msg);
        }
      });

      // Consume heartbeat messages
      const heartbeatQueue = 'device_heartbeat';
      await this.channel.assertQueue(heartbeatQueue, { durable: true });
      await this.channel.bindQueue(heartbeatQueue, 'irrigation', 'device.heartbeat');
      this.channel.consume(heartbeatQueue, (msg) => {
        if (msg) {
          const message = JSON.parse(msg.content.toString());
          this.handleHeartbeat(message);
          this.channel.ack(msg);
        }
      });
      
      console.log('RabbitMQ consumers setup completed');
    } catch (error) {
      console.error('Failed to setup RabbitMQ consumers:', error);
    }
  }

  handleDeviceRegistration(message: any) {
    const { rpi_id, rpi_name, capabilities, queues, timestamp } = message;
    
    // Check if we already have this device from mDNS
    const existingDevice = this.devices.get(rpi_id);
    
    this.devices.set(rpi_id, {
      ...existingDevice, // Keep any existing properties
      id: rpi_id,
      name: rpi_name,
      capabilities,
      queues,
      lastHeartbeat: timestamp,
      discoveryMethod: 'rabbitmq',
    });
    
    console.log(`Registered device via RabbitMQ: ${rpi_id} (${rpi_name})`);

    // Dynamically bind status queue for this device
    this.bindStatusQueue(rpi_id, queues.status).catch(err => {
      console.error(`Failed to bind status queue for ${rpi_id}:`, err);
    });
  }

  async bindStatusQueue(rpiId: string, statusQueue: string) {
    try {
      console.log(`Setting up status queue for ${rpiId}: ${statusQueue}`);
      
      // Make sure the channel is available
      if (!this.channel) {
        console.error(`Cannot bind status queue for ${rpiId} - channel not available`);
        return;
      }
      
      await this.channel.assertQueue(statusQueue, { durable: true });
      await this.channel.bindQueue(statusQueue, 'irrigation', `status.${rpiId}`);
      this.channel.consume(statusQueue, (msg) => {
        if (msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            this.handleStatusUpdate(message);
            this.channel.ack(msg);
          } catch (error) {
            console.error(`Error processing message on status queue for ${rpiId}:`, error);
            // Reject the message but don't requeue it if it's malformed
            this.channel.nack(msg, false, false);
          }
        }
      });
      console.log(`Bound status queue for ${rpiId}: ${statusQueue}`);
    } catch (error) {
      console.error(`Failed to bind status queue for ${rpiId}:`, error);
      throw error;
    }
  }

  handleStatusUpdate(message: any) {
    const { rpi_id, rpi_name, timestamp, soil_is_dry, pump_active, automatic_mode, last_watered, temperature, humidity } = message;
    const device = this.devices.get(rpi_id);
    if (device) {
      // Log the full message for debugging
      console.log('Received full status message:', JSON.stringify(message));
      console.log('Extracted humidity value:', humidity);
      
      this.devices.set(rpi_id, { 
        ...device, 
        lastHeartbeat: timestamp,
        // Store the status info
        status: {
          soil_is_dry,
          pump_active,
          automatic_mode,
          last_watered,
          temperature,
          humidity  // Add humidity to the status object
        }
      });
      console.log(`Status update for ${rpi_id}:`, {
        soil_is_dry,
        pump_active,
        automatic_mode,
        temperature,
        humidity  // Add humidity to the log
      });
    }
  }

  handleHeartbeat(message: any) {
    const { rpi_id, timestamp } = message;
    const device = this.devices.get(rpi_id);
    if (device) {
      this.devices.set(rpi_id, { ...device, lastHeartbeat: timestamp });
      console.log(`Heartbeat from ${rpi_id}`);
    }
  }

  async discoverDevices() {
    return Array.from(this.devices.values());
  }

  async sendCommand(rpiId: string, command: { 
    pump_control?: string; 
    mode?: string;
    ventilator_control?: string;
    led_control?: string;
  }) {
    const device = this.devices.get(rpiId);
    if (!device) {
      throw new Error(`Device ${rpiId} not found`);
    }
  
    if (!device.queues || !device.queues.command) {
      throw new Error(`Command queue not found for device ${rpiId}`);
    }
  
    const message = {
      target_id: rpiId,
      ...command,
      timestamp: Date.now() / 1000,
    };
  
    // Publish directly to the device's command queue
    try {
      await this.channel.publish(
        'irrigation', // Exchange name
        `command.${rpiId}`, // Routing key
        Buffer.from(JSON.stringify(message)),
        { contentType: 'application/json', deliveryMode: 2 } // Persistent message
      );
      console.log(`Sent command to ${rpiId}:`, command);
      return { status: 'Command sent', rpiId, command };
    } catch (error) {
      console.error(`Failed to send command to ${rpiId}:`, error);
      throw new Error(`Failed to send command: ${error.message}`);
    }
  }
  async getDeviceStatus(rpiId: string) {
    const device = this.devices.get(rpiId);
    if (!device) {
      throw new Error(`Device ${rpiId} not found`);
    }
    return {
      ...device,
      status: device.status || {}
    };
  }
  async findDeviceByIp(ipAddress: string) {
    // Cherche le périphérique par son adresse IP
    for (const [id, device] of this.devices.entries()) {
      if (device.ip === ipAddress) {
        return { ...device, id };
      }
    }
    
    throw new Error(`Aucun périphérique trouvé avec l'adresse IP ${ipAddress}`);
  }
  async registerDeviceQueues(rpiId: string, commandQueue: string, statusQueue: string) {
    const device = this.devices.get(rpiId);
    if (!device) {
      throw new Error(`Device ${rpiId} not found`);
    }
    
    this.devices.set(rpiId, {
      ...device,
      queues: {
        command: commandQueue,
        status: statusQueue
      }
    });
    
    // Connecte la queue de statut
    await this.bindStatusQueue(rpiId, statusQueue);
    
    return { status: 'Device queues registered', rpiId };
  }

  async getSystemStatus() {
    try {
      // Find the first available device
      const devices = Array.from(this.devices.values());
      if (devices.length === 0) {
        throw new Error('No irrigation devices found');
      }
      
      const device = devices[0];
      if (!device.queues?.command) {
        throw new Error('Device command queue not found');
      }

      // Send status request command
      const message = {
        target_id: device.id,
        request_status: true,
        timestamp: Date.now() / 1000,
      };

      await this.channel.publish(
        'irrigation',
        `command.${device.id}`,
        Buffer.from(JSON.stringify(message)),
        { contentType: 'application/json', deliveryMode: 2 }
      );

      // Return the current device state
      return device;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw new Error(`Failed to get system status: ${error.message}`);
    }
  }

  @EventPattern(IRRIGATION_PATTERNS.SET_PUMP_STATE)
  async setPumpState(state: boolean | any) {
    try {
      console.log('Received setPumpState command:', state);
      
      // Handle both boolean and object format
      let pumpState: boolean;
      let forceManualMode: boolean = false;
      let operationMode: 'AUTOMATIC' | 'MANUAL' = undefined;
      
      if (typeof state === 'boolean') {
        pumpState = state;
      } else if (typeof state === 'object') {
        // Extract pump state from different message formats
        if (state.pump_control) {
          pumpState = state.pump_control === 'ON';
        } else if (state.state !== undefined) {
          pumpState = !!state.state;
        } else {
          throw new Error('Invalid pump control message format');
        }
        
        // Check if we should force manual mode
        forceManualMode = !!state.force_manual_mode;
        
        // Check if mode is specified
        if (state.mode && ['AUTOMATIC', 'MANUAL'].includes(state.mode.toUpperCase())) {
          operationMode = state.mode.toUpperCase() as 'AUTOMATIC' | 'MANUAL';
        }
      } else {
        throw new Error('Invalid pump control message format');
      }
      
      // Try to find devices, with retry logic
      let devices = Array.from(this.devices.values());
      let retryCount = 0;
      const maxRetries = 5;
      
      // If no devices are found, wait and retry a few times
      while (devices.length === 0 && retryCount < maxRetries) {
        console.log(`No devices found, waiting for device registration (attempt ${retryCount + 1}/${maxRetries})...`);
        // Wait for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        devices = Array.from(this.devices.values());
        retryCount++;
      }
      
      if (devices.length === 0) {
        console.error('No irrigation devices found after retries');
        throw new Error('No irrigation devices found after retries');
      }
      
      const device = devices[0];
      if (!device.queues?.command) {
        console.error('Device command queue not found');
        throw new Error('Device command queue not found');
      }

      console.log(`Setting pump state to ${pumpState ? 'ON' : 'OFF'} for device ${device.id}`);
      
      // If forced to manual mode or mode specified, set operation mode first
      if (forceManualMode || operationMode) {
        const mode = operationMode || 'MANUAL';
        console.log(`Setting operation mode to ${mode} due to ${forceManualMode ? 'force flag' : 'mode specification'}`);
        
        const modeMessage = {
          target_id: device.id,
          mode: mode,
          timestamp: Date.now() / 1000,
        };
        
        await this.channel.publish(
          'irrigation',
          `command.${device.id}`,
          Buffer.from(JSON.stringify(modeMessage)),
          { contentType: 'application/json', deliveryMode: 2 }
        );
        
        // Wait a moment for mode change to take effect
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Send pump control command
      const message = {
        target_id: device.id,
        pump_control: pumpState ? 'ON' : 'OFF',
        timestamp: Date.now() / 1000,
      };

      // Log the exact routing information
      console.log('Publishing message:', {
        exchange: 'irrigation',
        routingKey: `command.${device.id}`,
        message,
        queueName: device.queues.command
      });

      // Ensure the command queue exists and is bound
      await this.channel.assertQueue(device.queues.command, { durable: true });
      await this.channel.bindQueue(
        device.queues.command,
        'irrigation',
        `command.${device.id}`
      );

      await this.channel.publish(
        'irrigation',
        `command.${device.id}`,
        Buffer.from(JSON.stringify(message)),
        { 
          contentType: 'application/json', 
          deliveryMode: 2,
          mandatory: true
        }
      );

      // Add confirmation handler
      this.channel.on('return', (msg) => {
        console.error('Message was returned by RabbitMQ:', msg);
        throw new Error('Failed to deliver message to queue');
      });

      // Wait a moment and check device status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the command was received
      try {
        const updatedDevice = await this.getDeviceStatus(device.id);
        console.log('Device status after command:', updatedDevice);
        
        const deviceStatus = updatedDevice.status as DeviceStatus;
        if (deviceStatus?.pump_active !== pumpState) {
          console.warn('Pump state mismatch - expected:', pumpState, 'actual:', deviceStatus?.pump_active);
        }
      } catch (error) {
        console.warn('Failed to verify pump state:', error);
      }

      return { status: 'Command sent', deviceId: device.id, command: message };
    } catch (error) {
      console.error('Failed to set pump state:', error);
      throw new Error(`Failed to set pump state: ${error.message}`);
    }
  }

  async setOperationMode(mode: 'AUTOMATIC' | 'MANUAL') {
    try {
      const devices = Array.from(this.devices.values());
      if (devices.length === 0) {
        console.error('No irrigation devices found');
        throw new Error('No irrigation devices found');
      }
      
      const device = devices[0];
      if (!device.queues?.command) {
        console.error('Device command queue not found');
        throw new Error('Device command queue not found');
      }

      console.log(`Setting operation mode to ${mode} for device ${device.id}`);

      const message = {
        target_id: device.id,
        mode: mode,
        timestamp: Date.now() / 1000,
      };

      console.log('Publishing message to RabbitMQ:', {
        exchange: 'irrigation',
        routingKey: `command.${device.id}`,
        message
      });

      await this.channel.publish(
        'irrigation',
        `command.${device.id}`,
        Buffer.from(JSON.stringify(message)),
        { 
          contentType: 'application/json', 
          deliveryMode: 2,
          mandatory: true
        }
      );

      // Add confirmation handler
      this.channel.on('return', (msg) => {
        console.error('Message was returned by RabbitMQ:', msg);
        throw new Error('Failed to deliver message to queue');
      });

      return { status: 'Command sent', deviceId: device.id, command: message };
    } catch (error) {
      console.error('Failed to set operation mode:', error);
      throw new Error(`Failed to set operation mode: ${error.message}`);
    }
  }

  async setTemperatureSensor(enabled: boolean) {
    try {
      // Find the first available device
      const devices = Array.from(this.devices.values());
      if (devices.length === 0) {
        throw new Error('No irrigation devices found');
      }
      
      const device = devices[0];
      if (!device.queues?.command) {
        throw new Error('Device command queue not found');
      }

      // Send temperature sensor control command
      const message = {
        target_id: device.id,
        dht_control: enabled ? 'ON' : 'OFF',
        timestamp: Date.now() / 1000,
      };

      await this.channel.publish(
        'irrigation',
        `command.${device.id}`,
        Buffer.from(JSON.stringify(message)),
        { contentType: 'application/json', deliveryMode: 2 }
      );

      return { status: 'Command sent', deviceId: device.id, command: message };
    } catch (error) {
      console.error('Failed to set temperature sensor state:', error);
      throw new Error(`Failed to set temperature sensor state: ${error.message}`);
    }
  }

  async updateSystemConfig(config: {
    dht_read_interval?: number;
    soil_check_interval?: number;
    pump_refresh_interval?: number;
  }) {
    try {
      // Find the first available device
      const devices = Array.from(this.devices.values());
      if (devices.length === 0) {
        throw new Error('No irrigation devices found');
      }
      
      const device = devices[0];
      if (!device.queues?.command) {
        throw new Error('Device command queue not found');
      }

      // Send config update command
      const message = {
        target_id: device.id,
        config: config,
        timestamp: Date.now() / 1000,
      };

      await this.channel.publish(
        'irrigation',
        `command.${device.id}`,
        Buffer.from(JSON.stringify(message)),
        { contentType: 'application/json', deliveryMode: 2 }
      );

      return { status: 'Command sent', deviceId: device.id, command: message };
    } catch (error) {
      console.error('Failed to update system config:', error);
      throw new Error(`Failed to update system config: ${error.message}`);
    }
  }

  private registerDefaultDevice() {
    const deviceId = 'simulated-pi1';
    const deviceName = 'raspberrypi';
    
    // Create standard queue names
    const commandQueue = `irrigation_system.${deviceId}.commands`;
    const statusQueue = `irrigation_system.${deviceId}.status`;
    
    // Register the device
    this.devices.set(deviceId, {
      id: deviceId,
      name: deviceName,
      capabilities: ['soil_moisture', 'water_pump', 'temperature_sensor'],
      queues: {
        command: commandQueue,
        status: statusQueue
      },
      lastHeartbeat: Date.now() / 1000,
      discoveryMethod: 'manual',
      status: {
        soil_is_dry: false,
        pump_active: false,
        automatic_mode: true,
        last_watered: null,
        temperature: null,
        humidity: null  // Add humidity field to default status
      }
    });
    
    console.log(`Manually registered default device: ${deviceId} (${deviceName})`);
    
    // Bind to the status queue
    this.bindStatusQueue(deviceId, statusQueue).catch(err => {
      console.error(`Failed to bind status queue for ${deviceId}:`, err);
    });
  }
}