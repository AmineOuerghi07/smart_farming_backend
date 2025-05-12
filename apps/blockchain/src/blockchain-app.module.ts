import { Module } from '@nestjs/common';
import { BlockchainModule } from './blockchain/blockchain.module';


@Module({
  imports: [BlockchainModule],
  controllers: [],
  providers: [],
})
export class BlockchainAppModule {}
