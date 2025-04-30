import { Test, TestingModule } from '@nestjs/testing';
import { IrrigationSystemController } from './irrigation-system.controller';

describe('IrrigationSystemController', () => {
  let controller: IrrigationSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IrrigationSystemController],
    }).compile();

    controller = module.get<IrrigationSystemController>(IrrigationSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
