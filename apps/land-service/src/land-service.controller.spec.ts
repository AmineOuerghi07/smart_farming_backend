import { Test, TestingModule } from '@nestjs/testing';
import { LandServiceController } from './land-service.controller';
import { LandServiceService } from './land-service.service';

describe('LandServiceController', () => {
  let landServiceController: LandServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LandServiceController],
      providers: [LandServiceService],
    }).compile();

    landServiceController = app.get<LandServiceController>(LandServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(landServiceController.getHello()).toBe('Hello World!');
    });
  });
});
