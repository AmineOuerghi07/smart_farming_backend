import { Injectable } from '@nestjs/common';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateFactureDto } from './dto/update-facture.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Facture } from './shemas/factureSchema';
import { Model } from 'mongoose';

@Injectable()
export class FactureService {
  constructor(@InjectModel(Facture.name) private factureModel: Model<Facture>) {}
  
  create(createFactureDto: CreateFactureDto): Promise<Facture> {
    const createdFacture = new this.factureModel({
      ...createFactureDto,
      user: createFactureDto.userId, 
    });
    return createdFacture.save();
  }

 

  findAll() {
    return this.factureModel.find();
  }

  findOne(id: string) {
    return this.factureModel.findById(id);
  }

  update(id: number, updateFactureDto: UpdateFactureDto) {
    return this.factureModel.findByIdAndUpdate
    (id, updateFactureDto, {new: true});
  }

  remove(id: string) {
    return this.factureModel.findByIdAndDelete(id);
  }

   async findByUserId(userId: string) {
    return this.factureModel.find({ userId }).exec();
  }
  
}
