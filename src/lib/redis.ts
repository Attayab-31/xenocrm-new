import { Redis } from 'ioredis';
import { logger } from './logger';

// Create a mock Redis client for environments where Redis is not available
class MockRedisClient {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  async get(key: string) {
    return this.cache.get(key);
  }

  async set(key: string, value: any, options?: any) {
    this.cache.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    this.cache.delete(key);
    return 1;
  }

  async lpush(key: string, ...values: any[]) {
    const list = this.cache.get(key) || [];
    list.unshift(...values);
    this.cache.set(key, list);
    return list.length;
  }

  async rpop(key: string) {
    const list = this.cache.get(key) || [];
    const item = list.pop();
    this.cache.set(key, list);
    return item;
  }

  async lrange(key: string, start: number, stop: number) {
    const list = this.cache.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }

  async ping() {
    return 'PONG';
  }

  on(event: string, callback: Function) {
    // Mock implementation to satisfy interface
    return this;
  }

  // Add other methods as needed
}

// Function to determine if we should use Redis
function shouldUseRedis(): boolean {
  // Skip Redis in certain environments
  if (process.env.SKIP_REDIS === 'true') {
    return false;
  }

  // Skip Redis during build process
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && process.env.VERCEL_ENV === 'development') {
    return false;
  }

  // Ensure Redis URL is available
  return !!process.env.REDIS_URL;
}

// Create redis client with proper error handling
let redisClient: Redis | MockRedisClient;

if (shouldUseRedis()) {
  const redisOptions = {
    retryStrategy: (times: number) => {
      if (times > 10) {
        // After 10 retries, stop trying and use mock
        logger.warn('Redis connection failed after 10 retries, using in-memory fallback');
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 10000,
    disconnectTimeout: 5000,
    commandTimeout: 10000,
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    lazyConnect: true, // Only connect when needed
  };

  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);

    // Add event listeners for better error handling and monitoring
    redisClient.on('error', (error: Error) => {
      logger.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Connection Ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting...');
    });
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    redisClient = new MockRedisClient();
  }
} else {
  logger.info('Using in-memory Redis fallback');
  redisClient = new MockRedisClient();
}

// Helper function to check Redis connection
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis Connection Check Failed:', error);
    return false;
  }
};

export default redisClient;