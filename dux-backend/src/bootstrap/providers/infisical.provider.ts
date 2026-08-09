import { InfisicalSDK } from "@infisical/sdk";
import dotenv from "dotenv";
import path from "path";
import { logProcess, logProcessError } from "../../app/logger/logger.utils.js";
import {
  getEnvNumber,
  getEnvVar,
  validateEnvs,
  validateInfisicalSecrets,
} from "../bootstrap.utils.js";
import type { ICache } from "../../app/cache/cache.interface.js";
import { provideRedisClient } from "../../app/cache/cache.provider.js";
import type { ILogger } from "../../app/interfaces/infrastructure/logger.interface.js";
import { GatewaySecrets, InfisicalConfig } from "../bootstrap.types.js";

const SECRETS_CACHE_KEY = "gateway:secrets";
const SECRETS_CACHE_TTL_SECONDS = 2700;

class SecretsBootstrapper {
  private readonly logger: ILogger;
  private client!: InfisicalSDK;
  private config!: InfisicalConfig;
  private redisUrl!: string;
  private redisClient!: ICache;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  async run(): Promise<{ secrets: GatewaySecrets; redisClient: ICache }> {
    try {
      this.loadEnvFile();
      this.readInfisicalConfig();
      await this.authenticate();
      await this.provisionRedis();

      const cached = await this.getCachedSecrets();
      if (cached) {
        return { secrets: cached, redisClient: this.redisClient };
      }

      await this.fetchAllSecrets();
      const secrets = this.validateAndAssemble(
        this.buildSystemEnvs(),
        this.buildModuleEnvs(),
      );
      await this.cacheSecrets(secrets);

      return { secrets, redisClient: this.redisClient };
    } catch (error) {
      logProcessError(this.logger, "bootstrapSecrets", error);
      throw new Error(`Error bootstrapping secrets: ${error}`);
    }
  }

  private loadEnvFile(): void {
    dotenv.config({ path: path.join(process.cwd(), ".env") });
  }

  private readInfisicalConfig(): void {
    const siteUrl = getEnvVar("INFISICAL_SITE_URL");
    const clientId = getEnvVar("INFISICAL_CLIENT_ID");
    const clientSecret = getEnvVar("INFISICAL_CLIENT_SECRET");
    const environment = getEnvVar("INFISICAL_ENVIRONMENT");
    const projectId = getEnvVar("INFISICAL_PROJECT_ID");

    validateEnvs({ siteUrl, clientId, clientSecret, environment, projectId });

    this.config = { siteUrl, clientId, clientSecret, environment, projectId };
  }

  private async authenticate(): Promise<void> {
    logProcess(this.logger, "Authenticating Infisical Client.....");

    this.client = new InfisicalSDK({ siteUrl: this.config.siteUrl });
    const infisicalClient = await this.client.auth().universalAuth.login({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
    });

    if (infisicalClient) {
      logProcess(this.logger, "Infisical Client Authenticated!");
    }
  }

  private async provisionRedis(): Promise<void> {
    logProcess(this.logger, "Fetching REDIS_URL from Infisical.....");

    const redisSecretRes = await this.client.secrets().getSecret({
      secretName: "REDIS_URL",
      environment: this.config.environment,
      projectId: this.config.projectId,
    });

    this.redisUrl = redisSecretRes.secretValue;
    this.redisClient = await provideRedisClient(this.redisUrl, this.logger);
  }

  private async getCachedSecrets(): Promise<GatewaySecrets | null> {
    const cached =
      await this.redisClient.get<GatewaySecrets>(SECRETS_CACHE_KEY);

    if (cached) {
      logProcess(this.logger, "Infisical secrets cache HIT");
      return cached;
    }

    logProcess(
      this.logger,
      "Infisical secrets cache MISSED fetching all secrets from Infisical.....",
    );
    return null;
  }

  private async fetchAllSecrets(): Promise<void> {
    await this.client.secrets().listSecrets({
      environment: this.config.environment,
      projectId: this.config.projectId,
      attachToProcessEnv: true,
    });
  }

  private buildSystemEnvs(): GatewaySecrets["systemEnvs"] {
    return {
      environment: getEnvVar("ENVIRONMENT", "dev"),
      databaseUrl: getEnvVar("DATABASE_URL", ""),
      port: getEnvNumber("PORT", 3000),
      logLevel: getEnvVar("LOG_LEVEL", "info"),
      redisUrl: this.redisUrl,
    };
  }

  private buildModuleEnvs(): GatewaySecrets["moduleEnvs"] {
    return {
      weatherApiUrl: getEnvVar("WEATHER_API_URL", ""),
      weatherApiKey: getEnvVar("WEATHER_API_KEY", ""),
      newsApiUrl: getEnvVar("NEWS_API_URL", ""),
      newsApiKey: getEnvVar("NEWS_API_KEY", ""),
      currencyApiUrl: getEnvVar("CURRENCY_API_URL", ""),
      currencyApiKey: getEnvVar("CURRENCY_API_KEY", ""),
      holidayApiUrl: getEnvVar("HOLIDAY_API_URL", ""),
      sportsApiUrl: getEnvVar("SPORTS_API_URL", ""),
      sportsApiKey: getEnvVar("SPORTS_API_KEY", ""),
      aviationApiUrl: getEnvVar("AVIATION_API_URL", ""),
      aviationApiKey: getEnvVar("AVIATION_API_KEY", ""),
      agroApiUrl: getEnvVar("AGRO_API_URL", ""),
      agroApiKey: getEnvVar("AGRO_API_KEY", ""),
      agroPolygonId: getEnvVar("AGRO_POLYGON_ID", ""),
    };
  }

  private validateAndAssemble(
    systemEnvs: GatewaySecrets["systemEnvs"],
    moduleEnvs: GatewaySecrets["moduleEnvs"],
  ): GatewaySecrets {
    validateInfisicalSecrets({ ...systemEnvs, ...moduleEnvs });
    return { systemEnvs, moduleEnvs };
  }

  private async cacheSecrets(secrets: GatewaySecrets): Promise<void> {
    try {
      await this.redisClient.set(
        SECRETS_CACHE_KEY,
        secrets,
        SECRETS_CACHE_TTL_SECONDS,
      );
      logProcess(
        this.logger,
        `Secrets cached in Redis (TTL: ${SECRETS_CACHE_TTL_SECONDS}s)`,
      );
    } catch (err) {
      logProcessError(this.logger, "cacheSecrets", err);
    }
  }
}

export async function bootstrapSecrets(
  logger: ILogger,
): Promise<{ secrets: GatewaySecrets; redisClient: ICache }> {
  return new SecretsBootstrapper(logger).run();
}
