import { Test, TestingModule } from '@nestjs/testing';
import { FactureService } from './facture.service';

describe('FactureService', () => {
  let service: FactureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FactureService],
    }).compile();

    service = module.get<FactureService>(FactureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
