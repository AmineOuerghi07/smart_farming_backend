import { Test, TestingModule } from '@nestjs/testing';
import { SmartFarmingApiGatewayController } from './smart-farming-api-gateway.controller';
import { SmartFarmingApiGatewayService } from './smart-farming-api-gateway.service';

describe('SmartFarmingApiGatewayController', () => {
  let smartFarmingApiGatewayController: SmartFarmingApiGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SmartFarmingApiGatewayController],
      providers: [SmartFarmingApiGatewayService],
    }).compile();

    smartFarmingApiGatewayController = app.get<SmartFarmingApiGatewayController>(SmartFarmingApiGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(smartFarmingApiGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
