// lands.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { Land, LandSchema } from './entities/land.entity';
import { LandRequest, LandRequestSchema } from './entities/requests.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }, {name: LandRequest.name, schema: LandRequestSchema}]),
  ],
  controllers: [LandsController],
  providers: [LandsService],
  exports: [MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }]), LandsService],
})
export class LandsModule {}