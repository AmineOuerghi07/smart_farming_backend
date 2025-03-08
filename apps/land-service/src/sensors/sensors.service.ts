import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor } from './entities/sensor.entity';

@Injectable()
export class SensorsService {
  constructor(@InjectModel(Sensor.name) private sensorModel: Model<Sensor>) {}

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const createdSensor = new this.sensorModel(createSensorDto);
    return createdSensor.save();
  }

  async findAll(): Promise<Sensor[]> {
    return this.sensorModel.find().exec();
  }

  async findOne(id: ObjectId): Promise<Sensor> {
    return this.sensorModel.findById(id).exec();
  }

  async update(id: ObjectId, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    return this.sensorModel.findByIdAndUpdate(
      id,
      updateSensorDto,
      { new: true }
    ).exec();
  }

  async remove(id: ObjectId): Promise<Sensor> {
    return this.sensorModel.findByIdAndDelete(id).exec();
  }
}