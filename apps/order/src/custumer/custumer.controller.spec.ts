import { Test, TestingModule } from '@nestjs/testing';
import { CustumerController } from './custumer.controller';
import { CustumerService } from './custumer.service';

describe('CustumerController', () => {
  let controller: CustumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustumerController],
      providers: [CustumerService],
    }).compile();

    controller = module.get<CustumerController>(CustumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
