import Redis from "ioredis";

export interface IRedisCacheProvider {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expiration: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  incr: (key: string) => Promise<number>;
}

export class RedisCacheProvider implements IRedisCacheProvider {
  private cache: Redis | null = null;
  constructor() {
    this.cache = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.cache?.get(key) ?? null;
  }

  async set(key: string, value: string, expiration: number): Promise<void> {
    await this.cache?.set(key, value, "EX", expiration);
  }

  async del(key: string): Promise<void> {
    await this.cache?.del(key);
  }

  async incr(key: string): Promise<number> {
    return (await this.cache?.incr(key)) ?? 0;
  }
}