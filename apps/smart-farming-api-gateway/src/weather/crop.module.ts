import { Module } from '@nestjs/common';
import { CropController } from './crop.controller';
import { CropService } from './crop.service';

@Module({
  controllers: [CropController],
  providers: [CropService],
})
export class CropModule {}
