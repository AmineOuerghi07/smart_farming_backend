import { Module } from '@nestjs/common';
import { SmartFarmingApiGatewayController } from './smart-farming-api-gateway.controller';
import { SmartFarmingApiGatewayService } from './smart-farming-api-gateway.service';
import { OrderModule } from './order/order.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { FactureModule } from './facture/facture.module';

import { LandModule } from './land/land.module';
import { SensorsModule } from './sensors/sensors.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [OrderModule, InventoryModule, ProductModule, FactureModule, LandModule, SensorsModule, AccountModule],
  controllers: [SmartFarmingApiGatewayController],
  providers: [SmartFarmingApiGatewayService],
})
export class SmartFarmingApiGatewayModule {}
