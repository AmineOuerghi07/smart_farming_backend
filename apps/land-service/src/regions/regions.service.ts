import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
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
}