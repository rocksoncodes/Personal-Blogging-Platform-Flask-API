export interface NewsSearchParams {
  q?: string;
  searchIn?: SearchInField[];
  sources?: string[];
  domains?: string[];
  excludeDomains?: string[];
  from?: string;
  to?: string;
  language?: LanguageCode;
  sortBy?: SortBy;
  pageSize?: number;
  page?: number;
}

export type SearchInField = "title" | "description" | "content";

export type SortBy = "relevancy" | "popularity" | "publishedAt";

export type LanguageCode =
  | "ar"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "he"
  | "it"
  | "nl"
  | "no"
  | "pt"
  | "ru"
  | "sv"
  | "ud"
  | "zh";
