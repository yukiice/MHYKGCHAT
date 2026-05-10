import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private logger = new Logger('RedisService');
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected successfully');
      });
      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn('Redis connection failed, running in offline mode');
      });
    } catch (error) {
      this.logger.warn('Redis initialization failed, running in offline mode');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    const result = await this.client.exists(key);
    return result === 1;
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
