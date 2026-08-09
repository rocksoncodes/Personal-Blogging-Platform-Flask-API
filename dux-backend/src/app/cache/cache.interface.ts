import type { Redis } from "ioredis";

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  getClient(): Redis;
  disconnect(): Promise<void>;
}
