import Redis from 'ioredis';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  nx?: boolean; // Only set if key doesn't exist
  xx?: boolean; // Only set if key exists
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  missRate: number;
  connectedClients: number;
  uptime: number;
}

export class RedisCache {
  private redis: Redis;
  // private config: CacheConfig;
  private isConnected = false;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(config: CacheConfig) {
    // this.config = config;
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'urjasync:',
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      lazyConnect: config.lazyConnect !== false,
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('🔴 Redis connected');
      this.isConnected = true;
    });

    this.redis.on('ready', () => {
      console.log('🔴 Redis ready for commands');
    });

    this.redis.on('error', (error) => {
      console.error('Redis error:', error);
      this.isConnected = false;
    });

    this.redis.on('close', () => {
      console.log('🔴 Redis connection closed');
      this.isConnected = false;
    });

    this.redis.on('reconnecting', () => {
      console.log('🔴 Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  // Basic cache operations
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(key);
      if (value !== null) {
        this.stats.hits++;
      } else {
        this.stats.misses++;
      }
      return value;
    } catch (error) {
      console.error('Redis GET error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set(key: string, value: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const args: any[] = [key, value];
      
      if (options.ttl) {
        args.push('EX', options.ttl);
      }
      
      if (options.nx) {
        args.push('NX');
      }
      
      if (options.xx) {
        args.push('XX');
      }

      const result = await (this.redis.set as any)(...args);
      this.stats.sets++;
      return result === 'OK';
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result = await this.redis.del(key);
      this.stats.deletes++;
      return result;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await (this.redis.expire as any)(key, seconds);
      return typeof result === 'number' ? result === 1 : false;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  // JSON operations
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET JSON error:', error);
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      return await this.set(key, serialized, options);
    } catch (error) {
      console.error('Redis SET JSON error:', error);
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(key, field);
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.redis.hset(key, field, value);
    } catch (error) {
      console.error('Redis HSET error:', error);
      return 0;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redis.hgetall(key);
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.redis.hdel(key, field);
    } catch (error) {
      console.error('Redis HDEL error:', error);
      return 0;
    }
  }

  // List operations
  async lpush(key: string, values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
      return 0;
    }
  }

  async rpush(key: string, values: string[]): Promise<number> {
    try {
      return await this.redis.rpush(key, ...values);
    } catch (error) {
      console.error('Redis RPUSH error:', error);
      return 0;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.redis.lpop(key);
    } catch (error) {
      console.error('Redis LPOP error:', error);
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      console.error('Redis RPOP error:', error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      console.error('Redis LLEN error:', error);
      return 0;
    }
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    try {
      const result = await (this.redis.sadd as any)(key, member);
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Redis SADD error:', error);
      return 0;
    }
  }

  async srem(key: string, member: string): Promise<number> {
    try {
      const result = await (this.redis.srem as any)(key, member);
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Redis SREM error:', error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await (this.redis.sismember as any)(key, member);
      return typeof result === 'number' ? result === 1 : Boolean(result);
    } catch (error) {
      console.error('Redis SISMEMBER error:', error);
      return false;
    }
  }

  // Energy data specific caching
  async cacheEnergyData(deviceId: string, data: any, ttl: number = 300): Promise<boolean> {
    const key = `energy:${deviceId}:${Math.floor(Date.now() / (60 * 1000))}`; // Per minute key
    return await this.setJSON(key, data, { ttl });
  }

  async getEnergyData(deviceId: string, timestamp?: number): Promise<any | null> {
    const key = timestamp ? 
      `energy:${deviceId}:${Math.floor(timestamp / (60 * 1000))}` : 
      `energy:${deviceId}:${Math.floor(Date.now() / (60 * 1000))}`;
    
    return await this.getJSON(key);
  }

  async cacheDeviceStatus(deviceId: string, status: any, ttl: number = 60): Promise<boolean> {
    const key = `device:status:${deviceId}`;
    return await this.setJSON(key, status, { ttl });
  }

  async getDeviceStatus(deviceId: string): Promise<any | null> {
    return await this.getJSON(`device:status:${deviceId}`);
  }

  async cacheUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.setJSON(key, sessionData, { ttl });
  }

  async getUserSession(userId: string): Promise<any | null> {
    return await this.getJSON(`session:${userId}`);
  }

  async invalidateUserSession(userId: string): Promise<number> {
    return await this.del(`session:${userId}`);
  }

  // Analytics caching
  async cacheAnalyticsResult(key: string, result: any, ttl: number = 1800): Promise<boolean> {
    const cacheKey = `analytics:${key}`;
    return await this.setJSON(cacheKey, result, { ttl });
  }

  async getAnalyticsResult(key: string): Promise<any | null> {
    return await this.getJSON(`analytics:${key}`);
  }

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, window: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (window * 1000);

    try {
      // Remove old entries
      await (this.redis.zremrangebyscore as any)(key, 0, windowStart);

      // Get current count
      const count = await this.redis.zcard(key);

      if (count >= limit) {
        const oldestEntry = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestEntry.length > 0 ? parseInt(oldestEntry[1]) + window * 1000 : now + window * 1000;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime
        };
      }

      // Add current request
      await this.redis.zadd(key, now.toString(), now.toString());
      await this.redis.expire(key, window);

      return {
        allowed: true,
        remaining: limit - count - 1,
        resetTime: now + window * 1000
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + window * 1000
      };
    }
  }

  // Cache warming and bulk operations
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.redis.mget(...keys);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValues: Record<string, string>, options: CacheOptions = {}): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValues)) {
        if (options.ttl) {
          pipeline.setex(key, options.ttl, value);
        } else {
          pipeline.set(key, value);
        }
      }
      
      const results = await pipeline.exec();
      return results ? results.every(([, err]: any) => !err) : false;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  // Health check and statistics
  async healthCheck(): Promise<{
    connected: boolean;
    responseTime: number;
    memory: string;
    keys: number;
  }> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      const responseTime = Date.now() - startTime;
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        connected: this.isConnected,
        responseTime,
        memory,
        keys: keyCount
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        memory: 'unknown',
        keys: 0
      };
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      totalKeys: 0, // Would need INFO command
      memoryUsage: 'unknown', // Would need INFO command
      hitRate: total > 0 ? this.stats.hits / total : 0,
      missRate: total > 0 ? this.stats.misses / total : 0,
      connectedClients: 0, // Would need INFO command
      uptime: 0 // Would need INFO command
    };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }
}

// Singleton instance
let redisCache: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCache) {
    const config: CacheConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'urjasync:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    };

    redisCache = new RedisCache(config);
  }
  return redisCache;
}
