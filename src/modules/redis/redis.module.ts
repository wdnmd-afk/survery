import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const Redis = require('ioredis');
        return new Redis({
          host: configService.get('XIAOJU_SURVEY_REDIS_HOST') || 'localhost',
          port: configService.get('XIAOJU_SURVEY_REDIS_PORT') || 6379,
          username: configService.get('XIAOJU_SURVEY_REDIS_USERNAME'),
          password: configService.get('XIAOJU_SURVEY_REDIS_PASSWORD'),
          db: configService.get('XIAOJU_SURVEY_REDIS_DB') || 0,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}