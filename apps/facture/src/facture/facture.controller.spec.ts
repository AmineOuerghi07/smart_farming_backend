import { Test, TestingModule } from '@nestjs/testing';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';

describe('FactureController', () => {
  let controller: FactureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactureController],
      providers: [FactureService],
    }).compile();

    controller = module.get<FactureController>(FactureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
