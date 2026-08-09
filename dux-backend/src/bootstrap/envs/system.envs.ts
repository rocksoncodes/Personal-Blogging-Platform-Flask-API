import { ISystemSecretsRegistry } from "../../app/interfaces/index.interface.js";

export class SystemEnvs implements ISystemSecretsRegistry {
  public readonly environment: string;
  public readonly port: number;
  public readonly logLevel: string;
  public readonly redisUrl: string;
  public readonly databaseUrl: string;

  constructor(systemEnvs: ISystemSecretsRegistry) {
    this.environment = systemEnvs.environment;
    this.port = systemEnvs.port;
    this.logLevel = systemEnvs.logLevel;
    this.redisUrl = systemEnvs.redisUrl;
    this.databaseUrl = systemEnvs.databaseUrl;
  }
}
