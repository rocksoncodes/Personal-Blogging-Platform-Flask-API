export interface FlightsParams {
  flight_date?: string;
  flight_status?:
    | "scheduled"
    | "active"
    | "landed"
    | "cancelled"
    | "incident"
    | "diverted";

  dep_iata?: string;
  dep_icao?: string;

  arr_iata?: string;
  arr_icao?: string;

  airline_name?: string;
  airline_iata?: string;
  airline_icao?: string;

  flight_number?: string;
  flight_iata?: string;
  flight_icao?: string;

  aircraft_icao?: string;

  limit?: number;
  offset?: number;
}

export interface AirportsParams {
  airport_name?: string;
  iata_code?: string;
  icao_code?: string;
  country_name?: string;
  country_iso2?: string;
  city_iata_code?: string;
  limit?: number;
  offset?: number;
}

export interface AirlinesParams {
  airline_name?: string;
  iata_code?: string;
  icao_code?: string;
  fleet_average_age?: number;
  country_name?: string;
  limit?: number;
  offset?: number;
}

export interface AircraftTypesParams {
  aircraft_name?: string;
  iata_code?: string;
  icao_code?: string;
  limit?: number;
  offset?: number;
}

export interface AircraftRegistrationParams {
  registration_number?: string;
  limit?: number;
  offset?: number;
}

export interface CitiesParams {
  city_name?: string;
  iata_code?: string;
  country_iso2?: string;
  limit?: number;
  offset?: number;
}

export interface CountriesParams {
  country_name?: string;
  country_iso2?: string;
  country_iso3?: string;
  limit?: number;
  offset?: number;
}

export interface TaxesParams {
  tax_name?: string;
  iata_code?: string;
  country_iso2?: string;
  limit?: number;
  offset?: number;
}
