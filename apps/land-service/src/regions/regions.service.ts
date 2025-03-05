import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';
import { Land } from '../lands/entities/land.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<Region>,
    @InjectModel(Land.name) private landModel: Model<Land>
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const region = new this.regionModel({
      ...createRegionDto,
      land: createRegionDto.land,
      sensor: createRegionDto.sensors
    });
    
    // Update parent land
    await this.landModel.findByIdAndUpdate(
      createRegionDto.land,
      { $push: { regions: region._id } }
    );
    
    return region.save();
  }

  async findAll(): Promise<Region[]> {
    return this.regionModel.find().populate('land sensors').exec();
  }

  async findOne(id: ObjectId): Promise<Region> {
    return this.regionModel.findById(id).populate('land sensors').exec();
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    return await this.regionModel.findByIdAndUpdate(
      id,
      updateRegionDto,
      { new: true }
    ).populate('land sensors').exec();
  }

  async remove(id: ObjectId): Promise<Region> {
    const region = await this.regionModel.findByIdAndDelete(id).exec();
    
    // Remove from parent land
    await this.landModel.findByIdAndUpdate(
      region.land,
      { $pull: { regions: region._id } }
    );
    
    return region;
  }
  async addPlantToRegion(
    regionId: string,
    plantId: string,
    quantity: number,
  ): Promise<Region> {
    const region = await this.regionModel.findById(regionId).exec();
    
    console.log('Region:', region);
    console.log('Region plants:', region?.plants);
    
    if (!region) {
      throw new Error('Region not found');
    }
  
    if (!region.plants) {
      console.log('Plants is undefined, initializing to []');
      region.plants = [];
    }
  
    const plantEntry = region.plants.find((p) => p.plant && p.plant.toString() === plantId);
    if (plantEntry) {
      plantEntry.quantity += quantity;
    } else {
      try {
        const plantObjectId = new Types.ObjectId(plantId);
        region.plants.push({ plant: plantObjectId, quantity });
      } catch (error) {
        throw new Error('Invalid plantId: must be a valid ObjectId');
      }
    }
    await region.save()
    return region;
  }

  
}