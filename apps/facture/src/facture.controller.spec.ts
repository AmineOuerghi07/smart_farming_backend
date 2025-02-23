import { Test, TestingModule } from '@nestjs/testing';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';

describe('FactureController', () => {
  let factureController: FactureController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FactureController],
      providers: [FactureService],
    }).compile();

    factureController = app.get<FactureController>(FactureController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(factureController.getHello()).toBe('Hello World!');
    });
  });
});
