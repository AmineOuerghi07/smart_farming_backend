import { Test, TestingModule } from '@nestjs/testing';
import { LandController } from './land.controller';

describe('LandController', () => {
  let controller: LandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandController],
    }).compile();

    controller = module.get<LandController>(LandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
