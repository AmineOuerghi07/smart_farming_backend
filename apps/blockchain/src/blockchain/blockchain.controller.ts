import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { BlockchainService } from './blockchain.service';
import { BLOCKCHAIN_PATTERNS } from '@app/contracts/blockchain/blockchain.patterns';
import { BlockchainDto } from '@app/contracts/blockchain/dto/blockchain.dto';

@Controller()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @EventPattern(BLOCKCHAIN_PATTERNS.BLOCKCHAIN_CREATE_LAND_REQUEST)
  create(@Payload() createBlockchainDto: BlockchainDto) {
    return this.blockchainService.createRental(createBlockchainDto);
  }



  @MessagePattern(BLOCKCHAIN_PATTERNS.BLOCKCHAIN_GET_LAND_REQUEST_BY_ID)
  findOne() {
    return this.blockchainService.getAllRentals();
  }
}
