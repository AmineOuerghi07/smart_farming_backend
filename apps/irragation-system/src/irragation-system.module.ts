import { Module } from '@nestjs/common';
import { IrrigationSystemController } from './irragation-system.controller';
import { IrrigationSystemService } from './irragation-system.service';

@Module({
  imports: [],
  controllers: [IrrigationSystemController],
  providers: [IrrigationSystemService],
})
export class IrrigationSystemModule {}