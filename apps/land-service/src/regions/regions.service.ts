import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';
import { Land } from '../lands/entities/land.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_EVENTS } from '@app/contracts/notification/notification.events';

@Injectable()
export class RegionsService implements OnModuleInit {
  private readonly logger = new Logger(RegionsService.name);
  private notifiedSensors: Set<string> = new Set(); // Track notified sensors

  constructor(
    @InjectModel(Region.name) private regionModel: Model<Region>,
    @InjectModel(Land.name) private landModel: Model<Land>,
    @InjectModel(Sensor.name) private sensorModel: Model<Sensor>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy
  ) {}

  async cleanupTestData() {
    try {
      // Delete all test regions
      const testRegions = await this.regionModel.find({ name: 'Test Region' }).exec();
      for (const region of testRegions) {
        // Delete associated sensors
        for (const sensorId of region.sensors) {
          await this.sensorModel.findByIdAndDelete(sensorId).exec();
        }
        // Delete the region
        await this.regionModel.findByIdAndDelete(region._id).exec();
      }

      // Delete all test lands
      const testLands = await this.landModel.find({ name: 'Test Land' }).exec();
      for (const land of testLands) {
        await this.landModel.findByIdAndDelete(land._id).exec();
      }

      this.logger.log('Successfully cleaned up test data');
    } catch (error) {
      this.logger.error('Error cleaning up test data:', error);
      throw error;
    }
  }

  onModuleInit() {
    this.logger.log('RegionsService initialized');
    // Clean up test data on startup
    this.cleanupTestData().catch(error => {
      this.logger.error('Failed to clean up test data:', error);
    });

    setInterval(async () => {
      try {
        this.logger.log('Starting sensor check cycle...');
        const regions = await this.regionModel.find().populate('sensors land').exec();
        this.logger.log(`Found ${regions.length} regions to check`);

        if (regions.length === 0) {
          this.logger.warn('No regions found in the database');
          return;
        }

        for (const region of regions) {
          this.logger.log(`Checking region: ${region.name} (ID: ${region._id})`);
          
          if (!region.sensors || region.sensors.length === 0) {
            this.logger.warn(`No sensors found in region: ${region.name}`);
            continue;
          }

          for (const sensor of region.sensors as Sensor[]) {
            const sensorId = sensor._id.toString();
            this.logger.log(`Checking sensor: ${sensor.name} (ID: ${sensorId})`);
            this.logger.log(`Sensor values - Current: ${sensor.value}, Threshold: ${sensor.threshold}`);
            
            const isAboveThreshold = sensor.value > sensor.threshold;
            this.logger.log(`Is above threshold? ${isAboveThreshold}`);

            if (isAboveThreshold && !this.notifiedSensors.has(sensorId)) {
              this.logger.log(`Sensor ${sensor.name} is above threshold and not notified yet`);
              const land = region.land as Land;
              
              if (!land) {
                this.logger.warn(`No land found for region: ${region.name}`);
                continue;
              }

              this.logger.log(`Found land: ${land.name}`);
              const populatedLand = await this.landModel.findById(land).populate('user').exec();
              
              if (!populatedLand || !populatedLand.user) {
                this.logger.warn(`No user found for land: ${land.name}`);
                continue;
              }

              const userId = populatedLand.user._id.toString();
              this.logger.log(`Found user: ${userId}`);
              
              const message = `Alert! Sensor "${sensor.name}" in region "${region.name}" (Land: ${land.name}) has value ${sensor.value} > threshold ${sensor.threshold}`;
              this.logger.log(`Preparing to send notification: ${message}`);
              
              // Send notification through RabbitMQ
              this.notificationClient.emit(NOTIFICATION_EVENTS.SENSOR_ALERT, {
                userId,
                title: 'Sensor Alert',
                message
              }).subscribe({
                next: () => {
                  this.logger.log(`Notification sent successfully for sensor ${sensorId}`);
                  this.notifiedSensors.add(sensorId);
                },
                error: (error) => {
                  this.logger.error(`Error sending notification for sensor ${sensorId}:`, error);
                }
              });
            } else if (!isAboveThreshold && this.notifiedSensors.has(sensorId)) {
              this.logger.log(`Sensor ${sensor.name} dropped below threshold, resetting notification status`);
              this.notifiedSensors.delete(sensorId);
            }
          }
        }
      } catch (error) {
        this.logger.error('Error in sensor check cycle:', error);
      }
    }, 5000); // Keep polling every 5 seconds
  }

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    this.logger.log(`Creating new region: ${JSON.stringify(createRegionDto)}`);
    const region = new this.regionModel({
      ...createRegionDto,
      land: createRegionDto.land,
      sensors: createRegionDto.sensors,
    });

    await this.landModel.findByIdAndUpdate(createRegionDto.land, {
      $push: { regions: region._id },
    });

    const savedRegion = await region.save();
    this.logger.log(`Region created successfully: ${savedRegion._id}`);
    return savedRegion;
  }

  async findAll(): Promise<Region[]> {
    return this.regionModel.find().populate('land sensors').exec();
  }

  async findOne(id: ObjectId): Promise<Region> {
    return this.regionModel.findById(id).populate('land sensors').exec();
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    return await this.regionModel
      .findByIdAndUpdate(id, updateRegionDto, { new: true })
      .populate('land sensors')
      .exec();
  }

  async remove(id: ObjectId): Promise<Region> {
    const region = await this.regionModel.findByIdAndDelete(id).exec();
    await this.landModel.findByIdAndUpdate(region.land, {
      $pull: { regions: region._id },
    });
    return region;
  }

  async addPlantToRegion(regionId: string, plantId: string, quantity: number): Promise<Region> {
    const region = await this.regionModel.findById(regionId).exec();

    if (!region) throw new Error('Region not found');

    if (!region.plants) region.plants = [];

    const plantEntry = region.plants.find((p) => p.plant && p.plant.toString() === plantId);
    if (plantEntry) {
      plantEntry.quantity += quantity;
    } else {
      const plantObjectId = new Types.ObjectId(plantId);
      region.plants.push({ plant: plantObjectId, quantity });
    }
    await region.save();
    return region;
  }

  async addSensorToRegion(
    regionId: string,
    sensorId: string,
    sensorName: string,
    value: number,
    threshold: number
  ): Promise<Region> {
    this.logger.log(`Adding sensor to region ${regionId}: name=${sensorName}, value=${value}, threshold=${threshold}`);
    
    try {
      // First, find the region
      this.logger.log(`Looking for region with ID: ${regionId}`);
      const region = await this.regionModel.findById(regionId).exec();
      
      if (!region) {
        this.logger.error(`Region not found: ${regionId}`);
        // Let's check if the region exists with a different query
        const allRegions = await this.regionModel.find().exec();
        this.logger.log(`Total regions in database: ${allRegions.length}`);
        this.logger.log(`Available region IDs: ${allRegions.map(r => r._id.toString()).join(', ')}`);
        throw new Error(`Region not found: ${regionId}`);
      }

      this.logger.log(`Found region: ${region.name} (ID: ${region._id})`);

      // Create or update the sensor
      this.logger.log(`Creating/updating sensor with ID: ${sensorId}`);
      const sensor = await this.sensorModel.findOneAndUpdate(
        { _id: sensorId },
        { name: sensorName, value, threshold },
        { upsert: true, new: true }
      );
      this.logger.log(`Sensor created/updated: ${sensor._id}`);

      // Add sensor to region if not already present
      if (!region.sensors) {
        region.sensors = [];
      }

      const sensorObjectId = new Types.ObjectId(sensorId);
      if (!region.sensors.some(s => s.toString() === sensorId)) {
        region.sensors.push(sensorObjectId);
        await region.save();
        this.logger.log(`Added sensor ${sensorId} to region ${regionId}`);
      }

      // Return populated region
      const populatedRegion = await this.regionModel.findById(regionId).populate('land sensors').exec();
      this.logger.log(`Returning populated region with ${populatedRegion.sensors.length} sensors`);
      return populatedRegion;
    } catch (error) {
      this.logger.error(`Error in addSensorToRegion: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }
}