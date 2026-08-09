import { NextFunction, Request, RequestHandler, Response } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { MiddlewareRepo } from "./middleware.repository.js";
import type { ICache } from "../cache/cache.interface.js";

export type GatewayMiddleware = {
  authenticateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Promise<void>;
  rateLimitRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Promise<void>;
};

export class MiddlewareService implements GatewayMiddleware {
  private readonly middlewareRepo: MiddlewareRepo;
  private readonly limiter: RequestHandler;

  constructor(middlewareRepo: MiddlewareRepo, redisClient: ICache) {
    this.middlewareRepo = middlewareRepo;
    this.limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
      store: new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
          redisClient.getClient().call(command, ...args) as Promise<number>,
        prefix: "rl:",
      }),
    });
  }

  rateLimitRequest = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    this.limiter(req, res, next);
  };

  authenticateRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const apiKey =
        (req.headers["x-api-key"] as string) ||
        req.headers.authorization?.split(" ")[1];

      if (!apiKey) {
        res.status(401).json({ error: "Unauthorized: API key is missing" });
        return;
      }

      const isValid = await this.middlewareRepo.checkClientApiKey(apiKey);
      if (!isValid) {
        res.status(403).json({ error: "Forbidden: Invalid API key" });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
