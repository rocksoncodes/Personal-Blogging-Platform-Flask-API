import winston from "winston";
import { ILogger } from "../interfaces/infrastructure/logger.interface.js";
import { ILoggerConfig } from "../interfaces/system/logger.system.interface.js";

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(config: ILoggerConfig) {
    const isProduction = config.environment === "prod";

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ];

    if (isProduction) {
      transports.push(
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
        }),
      );
    }

    this.logger = winston.createLogger({
      level: config.logLevel || "info",
      exitOnError: false,
      format: winston.format.combine(
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports,
    });
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  error(message: string, ...meta: any[]): void {
    this.logger.error(message, ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, ...meta);
  }
}
