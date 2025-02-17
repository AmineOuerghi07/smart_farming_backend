import { Controller, Get } from '@nestjs/common';
import { SmartFarmingApiGatewayService } from './smart-farming-api-gateway.service';

@Controller()
export class SmartFarmingApiGatewayController {
  constructor(private readonly smartFarmingApiGatewayService: SmartFarmingApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.smartFarmingApiGatewayService.getHello();
  }
}
