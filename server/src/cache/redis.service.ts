import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }

    this.redis = new Redis(redisUrl);

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);

      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        this.logger.warn(`Invalid JSON in Redis cache for key: ${key}`);

        await this.redis.del(key).catch(() => undefined);

        return null;
      }
    } catch (error) {
      this.logger.error(`Redis GET failed for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Gets multiple keys in a single Redis MGET operation.
   *
   * The returned array has the exact same order as the input keys.
   */
  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) {
      return [];
    }

    try {
      const values = await this.redis.mget(...keys);

      return values.map((value, index) => {
        if (value === null) {
          return null;
        }

        try {
          return JSON.parse(value) as T;
        } catch {
          this.logger.warn(
            `Invalid JSON in Redis cache for key: ${keys[index]}`,
          );

          // Don't make the entire MGET fail because one value is corrupted.
          void this.redis.del(keys[index]).catch(() => undefined);

          return null;
        }
      });
    } catch (error) {
      this.logger.error('Redis MGET failed', error);

      // Redis should never make the application fail.
      return keys.map(() => null);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Redis SET failed for key: ${key}`, error);
    }
  }

  /**
   * Sets multiple keys using a Redis pipeline.
   */
  async setMany<T>(
    entries: Array<{
      key: string;
      value: T;
      ttlSeconds: number;
    }>,
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    try {
      const pipeline = this.redis.pipeline();

      for (const entry of entries) {
        pipeline.set(
          entry.key,
          JSON.stringify(entry.value),
          'EX',
          entry.ttlSeconds,
        );
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error('Redis bulk SET failed', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Redis DELETE failed for key: ${key}`, error);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error('Redis bulk DELETE failed', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
