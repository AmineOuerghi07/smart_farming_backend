import { Test, TestingModule } from '@nestjs/testing';
import { LandsController } from './lands.controller';
import { LandsService } from './lands.service';

describe('LandsController', () => {
  let controller: LandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandsController],
      providers: [LandsService],
    }).compile();

    controller = module.get<LandsController>(LandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
