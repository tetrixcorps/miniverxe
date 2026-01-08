// Redis Service
// Provides Redis client for token caching and session management

import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  private async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisPassword = process.env.REDIS_PASSWORD;

      this.client = createClient({
        url: redisUrl,
        ...(redisPassword && { password: redisPassword }),
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis: Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis: Connecting...');
      });

      this.client.on('ready', () => {
        console.log('Redis: Connected and ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis: Reconnecting...');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
    } catch (error) {
      console.error('Redis initialization error:', error);
      // Continue without Redis in development
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from Redis
   */
  async get(key: string): Promise<string | null> {
    if (!this.isReady() || !this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in Redis with optional expiration
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isReady() || !this.client) {
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set value with expiration (alias for set with TTL)
   */
  async setex(key: string, seconds: number, value: string): Promise<boolean> {
    return this.set(key, value, seconds);
  }

  /**
   * Delete key from Redis
   */
  async del(key: string): Promise<boolean> {
    if (!this.isReady() || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMultiple(keys: string[]): Promise<number> {
    if (!this.isReady() || !this.client || keys.length === 0) {
      return 0;
    }

    try {
      return await this.client.del(keys);
    } catch (error) {
      console.error(`Redis DEL MULTIPLE error:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isReady() || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isReady() || !this.client) {
      return false;
    }

    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isReady() || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.isReady() || !this.client) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
