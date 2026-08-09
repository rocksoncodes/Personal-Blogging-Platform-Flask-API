import { RedisClient } from "./redis.client.js";
import type { ICache } from "./cache.interface.js";
import type { ILogger } from "../interfaces/infrastructure/logger.interface.js";
import { logProcessError } from "../logger/logger.utils.js";

export async function provideRedisClient(
  redisUrl: string,
  logger: ILogger,
): Promise<ICache> {
  try {
    const redisClient = new RedisClient(redisUrl, logger);
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logProcessError(logger, "provideRedisClient", error);
    throw new Error(`Failed to connect to Redis: ${error}`);
  }
}
