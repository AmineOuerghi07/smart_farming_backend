import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(@InjectModel(Region.name) private readonly regionModel: Model<Region>) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const createdRegion = new this.regionModel(createRegionDto);
    return await createdRegion.save();
  }

  async findAll(): Promise<Region[]> {
    return await this.regionModel.find().populate('sensors').exec();
  }

  async findOne(id: string): Promise<Region> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid region ID`);
    }

    const region = await this.regionModel.findById(id).populate('sensors').exec();
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return region;
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid region ID`);
    }

    const updatedRegion = await this.regionModel.findByIdAndUpdate(id, updateRegionDto, { new: true }).exec();
    if (!updatedRegion) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return updatedRegion;
  }

  async remove(id: string): Promise<Region> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid region ID`);
    }

    const deletedRegion = await this.regionModel.findByIdAndDelete(id).exec();
    if (!deletedRegion) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return deletedRegion;
  }
}
