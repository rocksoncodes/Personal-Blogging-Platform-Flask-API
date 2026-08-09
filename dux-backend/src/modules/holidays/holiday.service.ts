import { HolidayResponse, PublicHolidaysParams } from "./holiday.types.js";
import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";

export class HolidayService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async getPublicHolidays(
    holidayParams: PublicHolidaysParams,
  ): Promise<HolidayResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "PublicHolidays",
        undefined,
        [`${holidayParams.year}`, `${holidayParams.countryCode}`],
      );
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getNextPublicHolidays(
    holidayParams: PublicHolidaysParams,
  ): Promise<HolidayResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "NextPublicHolidays",
        undefined,
        [`${holidayParams.countryCode}`],
      );
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getNextPublicHolidaysWorldwide(): Promise<HolidayResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "NextPublicHolidaysWorldwide",
      );
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getAvailableCountries(): Promise<HolidayResponse | undefined> {
    try {
      const response =
        await this.httpClient.makeApiRequest("AvailableCountries");
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getCountryInfo(
    holidayParams: PublicHolidaysParams,
  ): Promise<HolidayResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "CountryInfo",
        undefined,
        [`${holidayParams.countryCode}`],
      );
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getLongWeekend(
    holidayParams: PublicHolidaysParams,
  ): Promise<HolidayResponse | undefined> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "LongWeekend",
        undefined,
        [`${holidayParams.year}`, `${holidayParams.countryCode}`],
      );
      return response.data as HolidayResponse;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async IsTodayPublicHoliday(
    holidayParams: PublicHolidaysParams,
  ): Promise<unknown> {
    try {
      const response = await this.httpClient.makeApiRequest(
        "IsTodayPublicHoliday",
        undefined,
        [`${holidayParams.countryCode}`],
      );
      if (response.status === 200) return true;
      if (response.status === 204) return false;
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
