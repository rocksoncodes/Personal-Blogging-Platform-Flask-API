import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";
import { GetPolygonParams } from "./agro.types.js";

export class AgroService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async postPolygons() {
    try {
      const response = await this.httpClient.makeApiRequest(`polygons`);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getPolygons() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "polygons",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getSpecificPolygons(polygonsParams: GetPolygonParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        `polygons/${polygonsParams.polygonId}`,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async deletePolygons(polygonsParams: GetPolygonParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        `polygons/${polygonsParams.polygonId}`,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getPolygonWeather() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "weather/forcast",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getPolygonWeatherHistory() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "weather/history",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getPolygonCurrentHistory() {
    try {
      const response = await this.httpClient.makeApiRequest("soil", undefined);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getCurrentUvi() {
    try {
      const response = await this.httpClient.makeApiRequest("uvi", undefined);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getUviForecast() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "uvi/forecast",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getUviHistory() {
    try {
      const response = await this.httpClient.makeApiRequest("uvi/history");
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAccumulatedTemperature() {
    try {
      const response = await this.httpClient.makeApiRequest("temp", undefined);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAccumulatedPrecipitation() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "precipitation",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getNdviHistory() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "ndvi/history",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
