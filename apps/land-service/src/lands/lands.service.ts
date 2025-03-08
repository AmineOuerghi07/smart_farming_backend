import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { Land } from './entities/land.entity';
import { Plant } from '../plants/entities/plant.entity';

@Injectable()
export class LandsService {
  constructor(@InjectModel(Land.name) private landModel: Model<Land>) {}

  async create(createLandDto: CreateLandDto): Promise<Land> {
    const createdLand = new this.landModel({
      ...createLandDto,
      user: createLandDto.user, // Convert to ObjectId automatically
      regions: []
    });
    return createdLand.save();
  }

  async findAll(): Promise<Land[] | string> {
    const lands = await this.landModel.find({}).exec();
  
    // Check if no lands are found
    if (lands.length === 0) {
      return 'Nothing in the database'; // Custom message when no data is available
    }
  
    return lands;
  }
  

  async findOne(id: ObjectId): Promise<Land> {
    return this.landModel.findById(id)
      .populate('user')
      .exec();
  }

  async update(id: ObjectId, updateLandDto: UpdateLandDto): Promise<Land> {
    return this.landModel.findByIdAndUpdate(
      id,
      updateLandDto,
      { new: true }
    ).populate('user regions').exec();
  }

  async remove(id: ObjectId): Promise<Land> {
    return this.landModel.findByIdAndDelete(id).exec();
  }

  async getPlantsByLandId(landId: ObjectId): Promise<{ plant: Plant; totalQuantity: number }[]> {
    try {
      const land = await this.landModel
        .findById(landId)
        .populate({
          path: 'regions',
          model: 'Region', // Explicitly specify model (optional)
          populate: {
            path: 'plants.plant',
            model: 'Plant',
          },
        })
        .exec();

      if (!land) {
        throw new Error('Land not found');
      }

    //  console.log('Populated land.regions:', JSON.stringify(land.regions, null, 2));

      const plantMap = new Map<string, { plant: Plant; totalQuantity: number }>();

      // Handle case where regions might not be populated
      const regions = Array.isArray(land.regions) ? land.regions : [];
      for (const region of regions) {
        console.log('Region:', JSON.stringify(region, null, 2));
        // Check if region is a populated object with plants
        const plants = Array.isArray(region.plants) ? region.plants : [];
        for (const plantEntry of plants) {
          // Ensure plantEntry.plant is populated
          if (!plantEntry.plant || !plantEntry.plant._id) {
            console.warn('Skipping plantEntry with no populated plant:', plantEntry);
            continue;
          }
          const plantId = plantEntry.plant._id.toString();
          const quantity = plantEntry.quantity || 0;

          if (plantMap.has(plantId)) {
            const existing = plantMap.get(plantId)!;
            existing.totalQuantity += quantity;
          } else {
            plantMap.set(plantId, {
              plant: plantEntry.plant as unknown as Plant,
              totalQuantity: quantity,
            });
          }
        }
      }

      return Array.from(plantMap.values());
    } catch (error) {
      throw new Error(`Failed to fetch plants for land ${landId}: ${error.message}`);
    }
  }

  async findLandsByUserId(userId: string): Promise<Land[]> {
    const lands = await this.landModel.find({ user: userId }).exec();
  
    if (lands.length === 0) {
      throw new NotFoundException(`No lands found for user with ID ${userId}`);
    }
  
    return lands;
  }
}