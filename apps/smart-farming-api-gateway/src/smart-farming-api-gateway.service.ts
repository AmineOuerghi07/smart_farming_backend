import { Injectable } from '@nestjs/common';

@Injectable()
export class SmartFarmingApiGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
