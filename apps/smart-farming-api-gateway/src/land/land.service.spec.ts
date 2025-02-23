import { Test, TestingModule } from '@nestjs/testing';
import { LandService } from './land.service';

describe('LandService', () => {
  let service: LandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandService],
    }).compile();

    service = module.get<LandService>(LandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
