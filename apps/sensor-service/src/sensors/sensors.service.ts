import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor } from './entities/sensor.entity';

@Injectable()
export class SensorsService {
  constructor(@InjectModel(Sensor.name) private readonly sensorModel: Model<Sensor>) {}

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const createdSensor = new this.sensorModel(createSensorDto);
    return await createdSensor.save();
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorModel.find().populate('region').exec();
  }

  async findOne(id: string): Promise<Sensor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid sensor ID`);
    }

    const sensor = await this.sensorModel.findById(id).populate('region').exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return sensor;
  }

  async update(id: string, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid sensor ID`);
    }

    const updatedSensor = await this.sensorModel.findByIdAndUpdate(id, updateSensorDto, { new: true }).exec();
    if (!updatedSensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return updatedSensor;
  }

  async remove(id: string): Promise<Sensor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid sensor ID`);
    }

    const deletedSensor = await this.sensorModel.findByIdAndDelete(id).exec();
    if (!deletedSensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return deletedSensor;
  }
}
