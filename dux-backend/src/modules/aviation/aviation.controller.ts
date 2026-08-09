import { Request, Response } from "express";
import { AviationService } from "./aviation.service.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";
import {
  AircraftRegistrationParams,
  AircraftTypesParams,
  AirlinesParams,
  AirportsParams,
  CitiesParams,
  CountriesParams,
  FlightsParams,
  TaxesParams,
} from "./aviation.types.js";

export class AviationController {
  private readonly httpClient: AviationService;
  private readonly responseHandler: IResponseHandler;

  constructor(
    aviationService: AviationService,
    responseHandler: IResponseHandler,
  ) {
    this.httpClient = aviationService;
    this.responseHandler = responseHandler;
  }

  async handleGetFlightsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getFlights(),
      "Current Flights",
    );
  }

  async handleGetPastFlightsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: FlightsParams) => this.httpClient.getPastFlights(params),
      "Past Flights",
      ["flight_date"],
    );
  }

  async handleGetFlightScheduleRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getFlightSchedules(),
      "Flight Schedules",
    );
  }

  async handleGetFutureFlightsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.httpClient.getFutureFlights(),
      "Future Flights",
    );
  }

  async handleGetAirportsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: AirportsParams) => this.httpClient.getAirports(params),
      "Airports",
    );
  }

  async handleGetAirlinesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: AirlinesParams) => this.httpClient.getAirlines(params),
      "Flight Airlines",
    );
  }

  async handleAirCraftTypesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: AircraftTypesParams) => this.httpClient.getAirCraftTypes(params),
      "Air Craft Types",
    );
  }

  async handleGetAirCraftRegistrationRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: AircraftRegistrationParams) =>
        this.httpClient.getAirCraftRegistrations(params),
      "Air Registration",
    );
  }

  async handleGetCitiesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: CitiesParams) => this.httpClient.getCities(params),
      "Cities",
    );
  }

  async handleGetCountriesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: CountriesParams) => this.httpClient.getCountries(params),
      "Countries",
    );
  }

  async handleGetTaxesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: TaxesParams) => this.httpClient.getTaxes(params),
      "Taxes",
    );
  }
}
