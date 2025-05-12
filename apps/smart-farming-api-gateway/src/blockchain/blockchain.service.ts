import { Inject, Injectable } from '@nestjs/common';
import { CreateBlockchainDto } from './dto/create-blockchain.dto';
import { UpdateBlockchainDto } from './dto/update-blockchain.dto';
import { BLOCKCHAIN_NAME } from '@app/contracts/blockchain/blockchain.rmq';
import { ClientProxy } from '@nestjs/microservices';
import { BLOCKCHAIN_PATTERNS } from '@app/contracts/blockchain/blockchain.patterns';

@Injectable()
export class BlockchainService {
  constructor(@Inject(BLOCKCHAIN_NAME) private readonly client : ClientProxy) {}
  create(createBlockchainDto: CreateBlockchainDto) {
    return 'This action adds a new blockchain';
  }

  async findAll() {
    return await this.client.send(BLOCKCHAIN_PATTERNS.BLOCKCHAIN_GET_LAND_REQUEST_BY_ID, {});
  }

  async findOne(id: string) {
    return await this.client.send<any, string>(BLOCKCHAIN_PATTERNS.GET_RENTALS_BY_USER_ID, id);
  }

  update(id: number, updateBlockchainDto: UpdateBlockchainDto) {
    return `This action updates a #${id} blockchain`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockchain`;
  }
}
