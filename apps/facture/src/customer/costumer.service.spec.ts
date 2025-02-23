import { Test, TestingModule } from '@nestjs/testing';
import { CostumerService } from './costumer.service';

describe('CostumerService', () => {
  let service: CostumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostumerService],
    }).compile();

    service = module.get<CostumerService>(CostumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
