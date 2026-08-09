import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";
import {
  EventsResponse,
  LeaguesResponse,
  LookupByIdParams,
  LookupTableParams,
  PlayersResponse,
  SearchEventsParams,
  SearchPlayersParams,
  SearchTeamsParams,
  SearchVenuesParams,
  TableResponse,
  TeamsResponse,
  VenuesResponse,
} from "./sports.types.js";

export class SportsService {
  private readonly httpClient: IHttpClient;
  private readonly apiKey: string;

  constructor(httpClient: IHttpClient, apiKey: string) {
    this.httpClient = httpClient;
    this.apiKey = apiKey;
  }

  async getSearchedTeams(
    sportsParams: SearchTeamsParams,
  ): Promise<TeamsResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/searchteams.php`,
        sportsParams,
      );
      return response.data as TeamsResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getSearchedEvents(
    sportsParams: SearchEventsParams,
  ): Promise<EventsResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/searchevents.php`,
        sportsParams,
      );
      return response.data as EventsResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getSearchedPlayers(
    sportsParams: SearchPlayersParams,
  ): Promise<PlayersResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/searchplayers.php`,
        sportsParams,
      );
      return response.data as PlayersResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getSearchedVenues(
    sportsParams: SearchVenuesParams,
  ): Promise<VenuesResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/searchvenues.php`,
        sportsParams,
      );
      return response.data as VenuesResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getLookupLeague(
    sportsParams: LookupByIdParams,
  ): Promise<LeaguesResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/lookupleague.php`,
        sportsParams,
      );
      return response.data as LeaguesResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getLookupTable(
    sportsParams: LookupTableParams,
  ): Promise<TableResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        `${this.apiKey}/lookuptable.php`,
        sportsParams,
      );
      return response.data as TableResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
