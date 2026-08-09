import express, { type Express } from "express";
import morgan from "morgan";
import { useGatewayRouters } from "./modules/routes.registry.js";
import { bootstrapSecrets } from "./bootstrap/providers/infisical.provider.js";
import {
  createMorganStream,
  defaultLogger,
  logProcess,
} from "./app/logger/logger.utils.js";
import { bootGatewayControllers } from "./bootstrap/bootstrap.utils.js";
import { SystemEnvs } from "./bootstrap/envs/system.envs.js";
import { ModuleEnvs } from "./bootstrap/envs/module.envs.js";
import { WinstonLogger } from "./app/logger/winston.logger.js";
import { ControllerResponseHandler } from "./app/http/handlers/response.handler.js";
import { SharedDependencies } from "./bootstrap/bootstrap.types.js";
import { provideGatewayMiddleware } from "./app/middleware/middleware.provider.js";
import { providePrismaClient } from "./app/db/prisma.js";

async function startServer(): Promise<void> {
  try {
    const { secrets: serverSecrets, redisClient } =
      await bootstrapSecrets(defaultLogger);

    const systemEnvs = new SystemEnvs(serverSecrets.systemEnvs);
    const moduleEnvs = new ModuleEnvs(serverSecrets.moduleEnvs);
    const logger = new WinstonLogger(systemEnvs);
    const responseHandler = new ControllerResponseHandler(
      systemEnvs.environment,
    );

    const prismaClient = providePrismaClient(systemEnvs.databaseUrl);

    const sharedDependencies: SharedDependencies = {
      systemEnvs,
      moduleEnvs,
      logger,
      responseHandler,
      redisClient,
      prismaClient,
    };

    const controllers = bootGatewayControllers(sharedDependencies);

    const server: Express = express();

    const port: number = Number(systemEnvs.port) || 3000;
    const environment: string = systemEnvs.environment ?? "dev";
    const middleware = provideGatewayMiddleware(redisClient, prismaClient);
    const gatewayRouter = useGatewayRouters(controllers, middleware);

    server.use(morgan("combined", { stream: createMorganStream(logger) }));
    server.use(express.json());
    server.use("/v1", gatewayRouter);

    server.listen(port, (): void => {
      logProcess(logger, `Server running on ${port}`);
      logProcess(logger, `Server environment: ${environment}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logProcess(logger, `Received ${signal}. Shutting down gracefully...`);
      await redisClient.disconnect();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    defaultLogger.error(`Error starting Server: ${error}`);
  }
}

await startServer();
