import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { UserService } from './user.service';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthRedisService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async generateToken({ _id, username }: { _id: string; username: string }) {
    const useRedis = this.configService.get<boolean>('KD_SURVEY_USE_REDIS_TOKEN', false);
    
    if (useRedis) {
      const token = nanoid(32);
      const expiresIn = this.configService.get<string>('KD_SURVEY_JWT_EXPIRES_IN', '8h');
      const ttl = this.parseExpiresIn(expiresIn);
      
      const userInfo = { _id, username, loginTime: Date.now() };
      await this.redisService.setToken(`token:${token}`, userInfo, ttl);
      
      return token;
    } else {
      const secret = this.configService.get<string>('KD_SURVEY_JWT_SECRET');
      const expiresIn: StringValue = this.configService.get<StringValue>(
        'KD_SURVEY_JWT_EXPIRES_IN',
      );
      const signOptions: SignOptions = {
        expiresIn,
      };
      return sign({ _id, username }, secret, signOptions);
    }
  }

  async verifyToken(token: string) {
    const useRedis = this.configService.get<boolean>('KD_SURVEY_USE_REDIS_TOKEN', false);
    
    if (useRedis) {
      const userInfo = await this.redisService.getToken(`token:${token}`);
      if (!userInfo) {
        throw new Error('用户凭证错误或已过期');
      }
      
      const user = await this.userService.getUserByUsername(userInfo.username);
      if (!user) {
        await this.redisService.deleteToken(`token:${token}`);
        throw new Error('用户不存在');
      }
      
      const extendToken = this.configService.get<boolean>('KD_SURVEY_EXTEND_TOKEN_ON_USE', true);
      if (extendToken) {
        const expiresIn = this.configService.get<string>('KD_SURVEY_JWT_EXPIRES_IN', '8h');
        const ttl = this.parseExpiresIn(expiresIn);
        await this.redisService.extendToken(`token:${token}`, ttl);
      }
      
      return user;
    } else {
      let decoded;
      try {
        decoded = verify(
          token,
          this.configService.get<string>('KD_SURVEY_JWT_SECRET'),
        );
      } catch (err) {
        throw new Error('用户凭证错误');
      }
      const user = await this.userService.getUserByUsername(decoded.username);
      if (!user) {
        throw new Error('用户不存在');
      }
      return user;
    }
  }

  async logout(token: string) {
    const useRedis = this.configService.get<boolean>('KD_SURVEY_USE_REDIS_TOKEN', false);
    
    if (useRedis) {
      await this.redisService.deleteToken(`token:${token}`);
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 28800;
    }
  }
}
export { AuthRedisService as AuthService };