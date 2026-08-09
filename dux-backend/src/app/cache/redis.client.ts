import { Redis } from "ioredis";
import type { ICache } from "./cache.interface.js";
import type { ILogger } from "../interfaces/infrastructure/logger.interface.js";
import { logProcess, logProcessError } from "../logger/logger.utils.js";

export class RedisClient implements ICache {
  private readonly client: Redis;
  private readonly logger: ILogger;

  constructor(redisUrl: string, logger: ILogger) {
    this.logger = logger;
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.client.on("connect", () => {
      logProcess(this.logger, "Redis connected");
    });

    this.client.on("ready", () => {
      logProcess(this.logger, "Redis ready");
    });

    this.client.on("error", (err: Error) => {
      logProcessError(this.logger, "Redis connection error", err);
    });

    this.client.on("close", () => {
      logProcess(this.logger, "Redis connection closed");
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    await this.client.ping();
    logProcess(this.logger, "Redis ping successful");
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      logProcessError(
        this.logger,
        `RedisClient.get failed to parse value for key "${key}"`,
        "JSON parse error",
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialised = JSON.stringify(value);

    if (ttlSeconds !== undefined && ttlSeconds > 0) {
      await this.client.set(key, serialised, "EX", ttlSeconds);
    } else {
      await this.client.set(key, serialised);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  getClient(): Redis {
    return this.client;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    logProcess(this.logger, "Redis disconnected gracefully");
  }
}
