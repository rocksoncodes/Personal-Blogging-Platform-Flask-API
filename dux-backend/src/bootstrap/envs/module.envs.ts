import { IModuleSecretsRegistry } from "../../app/interfaces/index.interface.js";

export class ModuleEnvs implements IModuleSecretsRegistry {
  public readonly weatherApiUrl: string;
  public readonly weatherApiKey: string;
  public readonly newsApiUrl: string;
  public readonly newsApiKey: string;
  public readonly currencyApiUrl: string;
  public readonly currencyApiKey: string;
  public readonly holidayApiUrl: string;
  public readonly sportsApiUrl: string;
  public readonly sportsApiKey: string;
  public readonly aviationApiUrl: string;
  public readonly aviationApiKey: string;
  public readonly agroApiUrl: string;
  public readonly agroApiKey: string;
  public readonly agroPolygonId: string;

  constructor(moduleEnvs: IModuleSecretsRegistry) {
    this.weatherApiUrl = moduleEnvs.weatherApiUrl;
    this.weatherApiKey = moduleEnvs.weatherApiKey;
    this.newsApiUrl = moduleEnvs.newsApiUrl;
    this.newsApiKey = moduleEnvs.newsApiKey;
    this.currencyApiUrl = moduleEnvs.currencyApiUrl;
    this.currencyApiKey = moduleEnvs.currencyApiKey;
    this.holidayApiUrl = moduleEnvs.holidayApiUrl;
    this.sportsApiUrl = moduleEnvs.sportsApiUrl;
    this.sportsApiKey = moduleEnvs.sportsApiKey;
    this.aviationApiUrl = moduleEnvs.aviationApiUrl;
    this.aviationApiKey = moduleEnvs.aviationApiKey;
    this.agroApiUrl = moduleEnvs.agroApiUrl;
    this.agroApiKey = moduleEnvs.agroApiKey;
    this.agroPolygonId = moduleEnvs.agroPolygonId;
  }
}
