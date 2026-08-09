import { Request, Response } from "express";
import { SportsService } from "./sports.service.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";
import {
  LookupByIdParams,
  LookupTableParams,
  SearchEventsParams,
  SearchPlayersParams,
  SearchTeamsParams,
  SearchVenuesParams,
} from "./sports.types.js";

export class SportsController {
  private readonly httpClient: SportsService;
  private readonly responseHandler: IResponseHandler;

  constructor(sportsService: SportsService, responseHandler: IResponseHandler) {
    this.httpClient = sportsService;
    this.responseHandler = responseHandler;
  }

  async handleSearchedTeamsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: SearchTeamsParams) => this.httpClient.getSearchedTeams(params),
      "Sports Teams",
      ["t"],
    );
  }

  async handleSearchedEventsRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: SearchEventsParams) => this.httpClient.getSearchedEvents(params),
      "Sports Events",
      ["e", "s"],
    );
  }

  async handleSearchedPlayersRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: SearchPlayersParams) =>
        this.httpClient.getSearchedPlayers(params),
      "Team Players",
      ["p"],
    );
  }

  async handleSearchVenuesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: SearchVenuesParams) => this.httpClient.getSearchedVenues(params),
      "Sports Venues",
      ["v"],
    );
  }

  async handleLookupLeagueRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: LookupByIdParams) => this.httpClient.getLookupLeague(params),
      "Sports League(s)",
      ["id"],
    );
  }

  async handleLookupTableRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: LookupTableParams) => this.httpClient.getLookupTable(params),
      "Sports Table(s)",
      ["l"],
    );
  }
}
