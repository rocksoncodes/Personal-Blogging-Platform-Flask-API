import { Request, Response } from "express";
import { WeatherService } from "./weather.service.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";

export class WeatherController {
  private readonly httpClient: WeatherService;
  private readonly responseHandler: IResponseHandler;

  constructor(
    weatherService: WeatherService,
    responseHandler: IResponseHandler,
  ) {
    this.httpClient = weatherService;
    this.responseHandler = responseHandler;
  }

  async handleCurrentWeatherRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params) => this.httpClient.getCurrentWeather(params),
      "currentWeather",
      ["lat", "lon"],
    );
  }

  async handleForecastWeatherRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params) => this.httpClient.getWeatherForecast(params),
      "forecastWeather",
      ["lat", "lon"],
    );
  }
}
