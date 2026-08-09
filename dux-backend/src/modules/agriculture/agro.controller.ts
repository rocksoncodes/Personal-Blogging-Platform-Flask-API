import { Request, Response } from "express";
import { AgroService } from "./agro.service.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";
import { GetPolygonParams } from "./agro.types.js";

export class AgroController {
  private readonly httpClient: AgroService;
  private readonly responseHandler: IResponseHandler;

  constructor(agroService: AgroService, responseHandler: IResponseHandler) {
    this.httpClient = agroService;
    this.responseHandler = responseHandler;
  }

  async handlePostPolygonsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.postPolygons(),
      "New Polygon Created",
    );
  }

  async handleGetPolygonsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getPolygons(),
      "Polygons",
    );
  }

  async handleGetSpecificPolygonsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: GetPolygonParams) => this.httpClient.getSpecificPolygons(params),
      "getSpecificPolygons",
      ["polygonId"],
    );
  }

  async handleDeletePolygonsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: GetPolygonParams) => this.httpClient.deletePolygons(params),
      "deletePolygons",
      ["polygonId"],
    );
  }

  async handlePolygonCurrentHistoryRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getPolygonCurrentHistory(),
      "getPolygonCurrentHistory",
    );
  }

  async handlePolygonWeatherRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getPolygonWeather(),
      "getPolygonWeather",
    );
  }

  async handlePolygonWeatherHistoryRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getPolygonWeatherHistory(),
      "getPolygonWeatherHistory",
    );
  }

  async handlePolygonUviHistoryRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getUviHistory(),
      "getPolygonUviHistory",
    );
  }

  async handlePolygonUviForecastRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getUviForecast(),
      "getPolygonUviForecast",
    );
  }

  async handleAccumulatedTemperatureRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getAccumulatedTemperature(),
      "getAccumulatedTemperature",
    );
  }

  async handleAccumulatedPrecipitationRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getAccumulatedPrecipitation(),
      "getAccumulatedPrecipitation",
    );
  }

  async handleNdviHistoryRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getNdviHistory(),
      "getAccumulatedPrecipitation",
    );
  }
}
