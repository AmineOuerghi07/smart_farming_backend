import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SmartFarmingApiGatewayController } from './smart-farming-api-gateway.controller';
import { SmartFarmingApiGatewayService } from './smart-farming-api-gateway.service';
import { OrderModule } from './order/order.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { FactureModule } from './facture/facture.module';

import { LandModule } from './land/land.module';
import { SensorsModule } from './sensors/sensors.module';
import { AccountModule } from './account/account.module';
import { makeCounterProvider, makeGaugeProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CustomMetricsMiddleware } from './middleware/custom-metrics-middleware';

@Module({
  imports: [OrderModule, InventoryModule, ProductModule, FactureModule,
    LandModule,
    SensorsModule,
    AccountModule,
    PrometheusModule.register({
      path: '/metrics',
    }),],
  controllers: [SmartFarmingApiGatewayController],
  providers: [SmartFarmingApiGatewayService,
    makeCounterProvider({
      name: 'count',
      help: 'metric_help',
      labelNames: ['method', 'origin'] as string[],
    }),
    makeGaugeProvider({
      name: 'gauge',
      help: 'metric_help',
    }),],
})
export class SmartFarmingApiGatewayModule { 
  configure(consumer: MiddlewareConsumer) {
    //forRoutes('yourRootapi')
     consumer.apply(CustomMetricsMiddleware).forRoutes("/");
   }
}
