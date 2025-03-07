import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
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
  private notifiedSensors: Set<string> = new Set(); // Track notified sensors

  constructor(
    @InjectModel(Region.name) private regionModel: Model<Region>,
    @InjectModel(Land.name) private landModel: Model<Land>,
    @InjectModel(Sensor.name) private sensorModel: Model<Sensor>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy
  ) {}

  onModuleInit() {
    setInterval(async () => {
      console.log('Checking sensor values...');
      const regions = await this.regionModel.find().populate('sensors land').exec();

      for (const region of regions) {
        for (const sensor of region.sensors as Sensor[]) {
          const sensorId = sensor._id.toString();
          const isAboveThreshold = sensor.value > sensor.threshold;

          if (isAboveThreshold && !this.notifiedSensors.has(sensorId)) {
            // Sensor is above threshold and hasn't been notified yet
            const land = region.land as Land;
            if (land) {
              const populatedLand = await this.landModel.findById(land).populate('user').exec();
              if (populatedLand && populatedLand.user) {
                const userId = populatedLand.user._id.toString();
                const message = `Alert! Sensor "${sensor.name}" in region "${region.name}" (Land: ${land.name}) has value ${sensor.value} > threshold ${sensor.threshold}`;
                
                // Emit notification event through RabbitMQ
                this.notificationClient.emit(NOTIFICATION_EVENTS.SYSTEM_NOTIFICATION, {
                  userId,
                  title: 'Sensor Alert',
                  message,
                  metadata: {
                    sensorId,
                    regionId: region._id,
                    landId: land
                  }
                }).subscribe();

                this.notifiedSensors.add(sensorId); // Mark as notified
                console.log(`Notification sent for sensor ${sensorId}`);
              }
            }
          } else if (!isAboveThreshold && this.notifiedSensors.has(sensorId)) {
            // Sensor dropped below threshold, reset notification status
            this.notifiedSensors.delete(sensorId);
            console.log(`Reset notification status for sensor ${sensorId}`);
          }
        }
      }
    }, 5000); // Keep polling every 5 seconds
  }

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const region = new this.regionModel({
      ...createRegionDto,
      land: createRegionDto.land,
      sensors: createRegionDto.sensors, // Fixed typo: 'sensor' -> 'sensors'
    });

    await this.landModel.findByIdAndUpdate(createRegionDto.land, {
      $push: { regions: region._id },
    });

    return region.save();
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
    const region = await this.regionModel.findById(regionId).exec();
    if (!region) throw new Error('Region not found');

    if (!region.sensors) region.sensors = [];

    const sensorObjectId = new Types.ObjectId(sensorId);
    if (!region.sensors.some((sensor) => sensor.toString() === sensorId)) {
      region.sensors.push(sensorObjectId);
    }

    // Update or create sensor
    await this.sensorModel.findByIdAndUpdate(
      sensorId,
      { name: sensorName, value, threshold },
      { upsert: true, new: true }
    );

    const updatedRegion = await region.save();
    return this.regionModel.findById(updatedRegion._id).populate('land sensors').exec();
  }
}