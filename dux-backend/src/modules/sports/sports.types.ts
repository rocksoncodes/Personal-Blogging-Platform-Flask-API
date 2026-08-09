export interface Team {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string | null;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strCountry: string | null;
  strStadium: string | null;
  strDescriptionEN: string | null;
  intFormedYear: string | null;
}

export interface Player {
  idPlayer: string;
  strPlayer: string;
  idTeam: string | null;
  strTeam: string | null;
  strSport: string;
  strNationality: string | null;
  dateBorn: string | null;
  strPosition: string | null;
  strThumb: string | null;
  strDescriptionEN: string | null;
}

export interface Event {
  idEvent: string;
  strEvent: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strSeason: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string | null;
  strTime: string | null;
  strVenue: string | null;
  strStatus: string | null;
}

export interface League {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strCountry: string | null;
  strBadge: string | null;
  strDescriptionEN: string | null;
}

export interface Venue {
  idVenue: string;
  strVenue: string;
  strCountry: string | null;
  strLocation: string | null;
  intCapacity: string | null;
}

export interface TableEntry {
  idTeam: string;
  strTeam: string;
  strBadge: string | null;
  intRank: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intPoints: string;
}

export interface TeamsResponse {
  teams: Team[] | null;
}
export interface PlayersResponse {
  player: Player[] | null;
}
export interface EventsResponse {
  events: Event[] | null;
}
export interface LeaguesResponse {
  leagues: League[] | null;
}
export interface VenuesResponse {
  venues: Venue[] | null;
}
export interface TableResponse {
  table: TableEntry[] | null;
}

export interface SearchTeamsParams {
  t: string;
}

export interface SearchVenuesParams {
  v: string;
}
export interface SearchPlayersParams {
  p: string;
}
export interface SearchEventsParams {
  e: string;
  s?: string;
}
export interface LookupByIdParams {
  id: string;
}
export interface LookupTableParams {
  l: string;
  s?: string;
}
