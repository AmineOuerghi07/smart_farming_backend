import { Test, TestingModule } from '@nestjs/testing';
import { IrrigationSystemService } from './irrigation-system.service';

describe('IrrigationSystemService', () => {
  let service: IrrigationSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IrrigationSystemService],
    }).compile();

    service = module.get<IrrigationSystemService>(IrrigationSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
