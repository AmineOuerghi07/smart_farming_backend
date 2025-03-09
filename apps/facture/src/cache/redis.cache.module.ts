import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { RedisService } from './redis.cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';


const redisModuleFactory = CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async () => ({
    isGlobal: true,
        max: 10_000,
        store: (): any => redisStore({
          commandsQueueMaxLength: 10_000,
          socket: {
            host: 'localhost',
            port: 6379,
          }
        })
  }),
  inject: [ConfigService],
});


@Module({
  imports: [
    redisModuleFactory
  ],

  providers: [ RedisService ],

  exports: [ RedisService]
})

export class RedisCache {}