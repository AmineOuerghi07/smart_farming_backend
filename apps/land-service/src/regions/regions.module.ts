// regions.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { Region, RegionSchema } from './entities/region.entity';
import { LandsModule } from '../lands/lands.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
    LandsModule
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }])]
})
export class RegionsModule {}