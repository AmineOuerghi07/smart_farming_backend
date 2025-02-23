import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { Land } from './entities/land.entity';

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
}