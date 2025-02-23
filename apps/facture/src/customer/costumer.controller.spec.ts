import { Test, TestingModule } from '@nestjs/testing';
import { CostumerController } from './customer.controller';
import { CostumerService } from './costumer.service';

describe('CostumerController', () => {
  let controller: CostumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostumerController],
      providers: [CostumerService],
    }).compile();

    controller = module.get<CostumerController>(CostumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
