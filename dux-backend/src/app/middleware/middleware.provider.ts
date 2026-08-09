import {
  MiddlewareRepo,
  MiddlewareRepository,
} from "./middleware.repository.js";
import { MiddlewareService } from "./middleware.service.js";
import type { ICache } from "../cache/cache.interface.js";
import { PrismaClient } from "../../generated/prisma/client.js";

export function provideGatewayMiddleware(
  redisClient: ICache,
  prismaClient: PrismaClient,
) {
  const middlewareRepo: MiddlewareRepo = new MiddlewareRepository(prismaClient);

  return new MiddlewareService(middlewareRepo, redisClient);
}
