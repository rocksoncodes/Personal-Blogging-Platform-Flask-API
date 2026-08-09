type HolidayType =
  | "Public"
  | "Bank"
  | "School"
  | "Authorities"
  | "Optional"
  | "Observance";

export interface Holiday {
  date: string;
  name: string;
  countryCode: string;
  nationalHoliday: boolean;
  subdivisionCodes: string[] | null;
  holidayTypes: HolidayType[];
}

export interface PublicHolidaysParams {
  year?: number;
  countryCode: string;
}

export type HolidayResponse = Holiday[];
