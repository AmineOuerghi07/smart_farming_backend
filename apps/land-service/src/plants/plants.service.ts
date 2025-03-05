import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { Plant } from './entities/plant.entity';


@Injectable()
export class PlantsService {
  constructor(@InjectModel('Plant') private readonly plantModel: Model<Plant>) {}

  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    const newPlant = new this.plantModel(createPlantDto);
    return newPlant.save();
  }

  async findAll(): Promise<Plant[]> {
    return this.plantModel.find().exec();
  }

  async findOne(id: string): Promise<Plant> {
    return this.plantModel.findById(id).exec();
  }

  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    return this.plantModel
      .findByIdAndUpdate(id, updatePlantDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.plantModel.findByIdAndDelete(id).exec();
  }
}