import { WeatherController } from "../modules/weather/weather.controller.js";
import { NewsController } from "../modules/news/news.controller.js";
import { CurrencyController } from "../modules/currency/currency.controller.js";
import { HolidayController } from "../modules/holidays/holiday.controller.js";
import { SportsController } from "../modules/sports/sports.controller.js";
import { ILogger } from "../app/interfaces/infrastructure/logger.interface.js";
import { IResponseHandler } from "../app/interfaces/infrastructure/response.handler.interface.js";
import {
  IModuleSecretsRegistry,
  ISystemSecretsRegistry,
} from "../app/interfaces/index.interface.js";
import { AviationController } from "../modules/aviation/aviation.controller.js";
import { AgroController } from "../modules/agriculture/agro.controller.js";
import { AuthKeyController } from "../modules/auth/auth.controller.js";
import { ICache } from "../app/cache/cache.interface.js";
import { PrismaClient } from "../generated/prisma/client.js";

export type SharedDependencies = {
  systemEnvs: ISystemSecretsRegistry;
  moduleEnvs: IModuleSecretsRegistry;
  logger: ILogger;
  responseHandler: IResponseHandler;
  redisClient: ICache;
  prismaClient: PrismaClient;
};

export type GatewayControllers = {
  weatherController: WeatherController;
  newsController: NewsController;
  currencyController: CurrencyController;
  holidayController: HolidayController;
  sportsController: SportsController;
  aviationController: AviationController;
  argoController: AgroController;
  authController: AuthKeyController;
};

export type ModuleControllersProvider =
  | { name: "weather"; controller: WeatherController }
  | { name: "news"; controller: NewsController }
  | {
      name: "currency";
      controller: CurrencyController;
    }
  | { name: "holiday"; controller: HolidayController }
  | { name: "sports"; controller: SportsController }
  | { name: "aviation"; controller: AviationController }
  | { name: "argo"; controller: AgroController }
  | { name: "auth"; controller: AuthKeyController };

export type GatewaySecrets = {
  systemEnvs: {
    environment: string;
    databaseUrl: string;
    port: number;
    logLevel: string;
    redisUrl: string;
  };
  moduleEnvs: {
    weatherApiUrl: string;
    weatherApiKey: string;
    newsApiUrl: string;
    newsApiKey: string;
    currencyApiUrl: string;
    currencyApiKey: string;
    holidayApiUrl: string;
    sportsApiUrl: string;
    sportsApiKey: string;
    aviationApiUrl: string;
    aviationApiKey: string;
    agroApiUrl: string;
    agroApiKey: string;
    agroPolygonId: string;
  };
};

export type InfisicalConfig = {
  siteUrl: string;
  clientId: string;
  clientSecret: string;
  environment: string;
  projectId: string;
};
