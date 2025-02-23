// lands.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { Land, LandSchema } from './entities/land.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }])
  ],
  controllers: [LandsController],
  providers: [LandsService],
  exports: [MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }])]
})
export class LandsModule {}