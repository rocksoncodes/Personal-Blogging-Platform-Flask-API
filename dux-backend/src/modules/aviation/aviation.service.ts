import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";
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

export class AviationService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async getFlights() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "flights",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getPastFlights(flightParams: FlightsParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "flights",
        flightParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getFlightSchedules() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "flight_schedules",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getFutureFlights() {
    try {
      const response = await this.httpClient.makeApiRequest(
        "flightsFuture",
        undefined,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAirports(airportsParams: AirportsParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "airports",
        airportsParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAirlines(airlinesParams: AirlinesParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "airlines",
        airlinesParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAirCraftTypes(aircraftTypesParams: AircraftTypesParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "airplanes/types",
        aircraftTypesParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAirCraftRegistrations(
    airCraftRegistrationParams: AircraftRegistrationParams,
  ) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "airplanes",
        airCraftRegistrationParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getCities(citiesParams: CitiesParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "cities",
        citiesParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getCountries(countriesParams: CountriesParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "countries",
        countriesParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getTaxes(taxesParams: TaxesParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "taxes",
        taxesParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
