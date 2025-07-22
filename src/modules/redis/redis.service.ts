import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * 设置token到Redis
   * @param key token key
   * @param value token value (用户信息)
   * @param ttl 过期时间(秒)
   */
  async setToken(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  /**
   * 获取token信息
   * @param key token key
   */
  async getToken(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * 删除token
   * @param key token key
   */
  async deleteToken(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 检查token是否存在
   * @param key token key
   */
  async hasToken(key: string): Promise<boolean> {
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * 延长token过期时间
   * @param key token key
   * @param ttl 新的过期时间(秒)
   */
  async extendToken(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }

  /**
   * 获取token剩余过期时间
   * @param key token key
   */
  async getTokenTTL(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }
}