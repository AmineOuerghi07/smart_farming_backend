import { Module } from '@nestjs/common';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';
import { Facture, FactureSchema } from './shemas/factureSchema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports :[MongooseModule.forFeature([{name: Facture.name, schema: FactureSchema}])],
  controllers: [FactureController],
  providers: [FactureService],
})
export class FactureModule {}
