import { FACTURE_NAME } from '@app/contracts/facture/facture.rmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';

@Injectable()
export class RedisService {
  private logger = new Logger(RedisService.name);
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache & RedisStore) { }

  async get<T = unknown>(key: string) {
    return this.cache.get<T>(FACTURE_NAME + key);
  }

  async set(key: string, value: any, seconds = 600 /* 10min */) {
    return this.cache.set(FACTURE_NAME + key, value, { ttl: seconds }, null);
  }

  async del(key: string) {
    return this.cache.del(FACTURE_NAME + key);
  }
  
}