import { CurrentWeatherParams } from "./weather.types.js";
import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";

export class WeatherService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async getCurrentWeather(weatherParams: CurrentWeatherParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "weather",
        weatherParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getWeatherForecast(weatherParams: CurrentWeatherParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "forecast",
        weatherParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
