import { ILogger } from "../interfaces/infrastructure/logger.interface.js";
import { WinstonLogger } from "./winston.logger.js";
import { getEnvVar } from "../../bootstrap/bootstrap.utils.js";

export function logProcess(logger: ILogger, step: string): void {
  logger.info(`[PROCESS] ${step}`);
}

export function logProcessError(
  logger: ILogger,
  step: string,
  error: unknown,
): void {
  logger.error(`[PROCESS] Failed at: ${step} | ${error}`);
}

export function logBootstrapStep(logger: ILogger, step: string): void {
  logger.info(`[BOOTSTRAP] ${step}`);
}

export function logBootstrapError(
  logger: ILogger,
  step: string,
  error: unknown,
): void {
  logger.error(`[BOOTSTRAP] Failed at: ${step} | ${error}`);
}

export function logInboundRaw(logger: ILogger, message: string): void {
  logger.info(`[INBOUND] ${message}`);
}

export function createMorganStream(logger: ILogger) {
  return {
    write: (message: string) => logInboundRaw(logger, message.trim()),
  };
}

export const defaultLogger: ILogger = new WinstonLogger({
  logLevel: getEnvVar("LOG_LEVEL", "info"),
  environment: getEnvVar("ENVIRONMENT", "dev"),
});
