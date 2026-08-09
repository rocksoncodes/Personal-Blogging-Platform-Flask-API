import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";

export class CurrencyService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async getLiveRates(currencyParams: Record<string, string>): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "live",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getHistoricalRates(
    currencyParams: Record<string, string>,
  ): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "historical",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getConversionRates(
    currencyParams: Record<string, string>,
  ): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "convert",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getTimeframeRates(
    currencyParams: Record<string, string>,
  ): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "timeframe",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getChangeRates(currencyParams: Record<string, string>): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "change",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAllSupportedCurrencies(
    currencyParams: Record<string, string>,
  ): Promise<any> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "list",
        currencyParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
