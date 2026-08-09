# API Routes Reference

A complete reference for all endpoints exposed by the Public Services Gateway, with ready-to-use Postman examples.

All routes are versioned under `/v1` and are protected by rate limiting (100 requests per 15 minutes) and API key authentication. The gateway handles upstream API authentication automatically using secrets fetched from Infisical at startup.

## Authentication

All endpoints (except `/v1/auth/gateway-key`) require a valid API key. You can pass the API key via one of two headers:
- `x-api-key: gw_<secret>`
- `Authorization: Bearer gw_<secret>`

To generate a key, use the `/v1/auth/gateway-key` endpoint.

## Postman Setup

1. Create a Postman **Environment** and add the variable:
   ```
   baseUrl = http://localhost:3000
   apiKey = gw_<your_secret_key>
   ```
2. Set up authorization in Postman to use an `API Key` in the Header with key `x-api-key` and value `{{apiKey}}`.
3. Use `{{baseUrl}}` as a prefix in all requests below.


## Table of Contents

1. [Auth](#1-auth----v1auth)
2. [Weather](#2-weather----v1weather)
3. [News](#3-news----v1news)
4. [Currency](#4-currency----v1currency)
5. [Public Holidays](#5-public-holidays----v1holiday)
6. [Sports](#6-sports----v1sports)
7. [Aviation](#7-aviation----v1aviation)
8. [Agriculture](#8-agriculture----v1argo)


---

## 1. Auth — `/v1/auth`

| Method | Endpoint | Required params | Optional params |
|---|---|---|---|
| GET | `/v1/auth/gateway-key` | None | None |

---

### GET /v1/auth/gateway-key

Generates a new API key that can be used to authenticate with all other gateway endpoints.

**Postman Example**
```
GET {{baseUrl}}/v1/auth/gateway-key
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "ApiKeyResponse": {
      "apiKey": "gw_xY...z9Q",
      "createdAt": "2026-07-25T12:00:00.000Z"
    }
  }
}
```


---

## 1. Weather — `/v1/weather`

**Upstream API:** [OpenWeatherMap](https://openweathermap.org/api)

| Method | Endpoint | Required params | Optional params |
|---|---|---|---|
| GET | `/v1/weather/current` | `lat`, `lon` | `units`, `lang`, `mode`, `cnt` |
| GET | `/v1/weather/forecast` | `lat`, `lon` | `units`, `lang`, `mode`, `cnt` |

---

### GET /v1/weather/current

Returns current weather conditions for a given location.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `lat` | Yes | number | Latitude of the location |
| `lon` | Yes | number | Longitude of the location |
| `units` | No | string | Unit system: `standard` (default), `metric`, or `imperial` |
| `lang` | No | string | Language code for weather descriptions (e.g. `en`, `fr`) |
| `mode` | No | string | Response format: `json` (default) or `xml` |
| `cnt` | No | string | Number of results to return |

**Postman Example**
```
GET {{baseUrl}}/v1/weather/current?lat=51.5074&lon=-0.1278
GET {{baseUrl}}/v1/weather/current?lat=5.6037&lon=-0.1870&units=metric
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "currentWeather": {
      "coord": { "lon": -0.1278, "lat": 51.5074 },
      "weather": [{ "id": 800, "main": "Clear", "description": "clear sky" }],
      "main": {
        "temp": 289.15,
        "feels_like": 288.45,
        "humidity": 65
      },
      "wind": { "speed": 3.6 },
      "name": "London"
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `lat` or `lon` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/weather/forecast

Returns a 5-day / 3-hour interval weather forecast for a given location.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `lat` | Yes | number | Latitude of the location |
| `lon` | Yes | number | Longitude of the location |
| `units` | No | string | Unit system: `standard` (default), `metric`, or `imperial` |
| `lang` | No | string | Language code for weather descriptions |
| `mode` | No | string | Response format: `json` (default) or `xml` |
| `cnt` | No | string | Number of forecast time steps to return |

**Postman Example**
```
GET {{baseUrl}}/v1/weather/forecast?lat=51.5074&lon=-0.1278
GET {{baseUrl}}/v1/weather/forecast?lat=5.6037&lon=-0.1870&units=metric&cnt=10
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "forecastWeather": {
      "list": [
        {
          "dt": 1720000000,
          "main": { "temp": 288.5, "humidity": 70 },
          "weather": [{ "description": "light rain" }],
          "dt_txt": "2026-07-16 12:00:00"
        }
      ],
      "city": { "name": "London", "country": "GB" }
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `lat` or `lon` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |


---

## 2. News — `/v1/news`

**Upstream API:** [NewsAPI](https://newsapi.org/)

| Method | Endpoint | Required params | Optional params |
|---|---|---|---|
| GET | `/v1/news/topic` | `q` | `searchIn`, `sources`, `domains`, `from`, `to`, `language`, `sortBy`, `pageSize`, `page` |
| GET | `/v1/news/top-headlines` | `country` | `q`, `sources`, `language`, `pageSize`, `page` |

---

### GET /v1/news/topic

Searches all news articles matching a keyword or phrase via NewsAPI's `everything` endpoint.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `q` | Yes | string | Search term or phrase (e.g. `technology`, `climate change`) |
| `searchIn` | No | string | Fields to search: `title`, `description`, or `content` |
| `sources` | No | string | Comma-separated source IDs (e.g. `bbc-news,cnn`) |
| `domains` | No | string | Comma-separated domains to restrict results (e.g. `bbc.co.uk`) |
| `from` | No | string | Oldest article date in ISO 8601 format (e.g. `2026-01-01`) |
| `to` | No | string | Newest article date in ISO 8601 format |
| `language` | No | string | Language code: `ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `no`, `pt`, `ru`, `sv`, `zh` |
| `sortBy` | No | string | Sort order: `relevancy`, `popularity`, or `publishedAt` |
| `pageSize` | No | number | Results per page (max 100, default 20) |
| `page` | No | number | Page number to return |

**Postman Example**
```
GET {{baseUrl}}/v1/news/topic?q=technology
GET {{baseUrl}}/v1/news/topic?q=climate+change&language=en&sortBy=publishedAt&pageSize=10
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Related Article(s)": {
      "status": "ok",
      "totalResults": 1234,
      "articles": [
        {
          "source": { "id": "bbc-news", "name": "BBC News" },
          "title": "Tech industry sees record growth",
          "description": "...",
          "url": "https://bbc.co.uk/...",
          "publishedAt": "2026-07-15T10:00:00Z"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `q` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/news/top-headlines

Fetches current top headlines filtered by country via NewsAPI's `top-headlines` endpoint.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `country` | Yes | string | Two-letter country code (e.g. `us`, `gb`, `gh`) |
| `q` | No | string | Optional keyword to filter headlines |
| `sources` | No | string | Comma-separated source IDs |
| `language` | No | string | Language code |
| `pageSize` | No | number | Results per page (max 100, default 20) |
| `page` | No | number | Page number to return |

**Postman Example**
```
GET {{baseUrl}}/v1/news/top-headlines?country=us
GET {{baseUrl}}/v1/news/top-headlines?country=gb&q=economy&pageSize=5
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Top Headlines": {
      "status": "ok",
      "totalResults": 38,
      "articles": [
        {
          "source": { "id": "cnn", "name": "CNN" },
          "title": "Breaking: Markets rally on positive data",
          "url": "https://cnn.com/...",
          "publishedAt": "2026-07-16T08:30:00Z"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `country` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |


---

## 3. Currency — `/v1/currency`

**Upstream API:** [Currencylayer](https://currencylayer.com/)

| Method | Endpoint | Required params |
|---|---|---|
| GET | `/v1/currency/list` | None |
| GET | `/v1/currency/live` | `symbols` |
| GET | `/v1/currency/historical` | `date` |
| GET | `/v1/currency/convert` | `from`, `to`, `amount` |
| GET | `/v1/currency/timeframe` | `start_date`, `end_date` |
| GET | `/v1/currency/change` | `start_date`, `end_date` |

---

### GET /v1/currency/list

Returns all currency codes and names supported by the Currencylayer API.

**Postman Example**
```
GET {{baseUrl}}/v1/currency/list
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "All Supported Currencies": {
      "success": true,
      "currencies": {
        "USD": "United States Dollar",
        "GBP": "British Pound Sterling",
        "EUR": "Euro",
        "GHS": "Ghanaian Cedi"
      }
    }
  }
}
```

---

### GET /v1/currency/live

Returns real-time exchange rates relative to a base currency (default: USD).

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `symbols` | Yes | string | Comma-separated currency codes to return (e.g. `EUR,GBP,GHS`) |

**Postman Example**
```
GET {{baseUrl}}/v1/currency/live?symbols=EUR,GBP,GHS
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Live Currency Rates": {
      "success": true,
      "source": "USD",
      "quotes": {
        "USDEUR": 0.91,
        "USDGBP": 0.78,
        "USDGHS": 15.2
      }
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `symbols` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/currency/historical

Returns exchange rates for a specific past date.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `date` | Yes | string | Date in `YYYY-MM-DD` format |

**Postman Example**
```
GET {{baseUrl}}/v1/currency/historical?date=2025-01-01
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Historical Rates": {
      "success": true,
      "date": "2025-01-01",
      "quotes": {
        "USDEUR": 0.89,
        "USDGBP": 0.77
      }
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `date` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/currency/convert

Converts a specified amount from one currency to another.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `from` | Yes | string | Source currency code (e.g. `USD`) |
| `to` | Yes | string | Target currency code (e.g. `GBP`) |
| `amount` | Yes | number | Numeric amount to convert |

**Postman Example**
```
GET {{baseUrl}}/v1/currency/convert?from=USD&to=GBP&amount=100
GET {{baseUrl}}/v1/currency/convert?from=EUR&to=GHS&amount=50
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Conversion Rates": {
      "success": true,
      "query": { "from": "USD", "to": "GBP", "amount": 100 },
      "result": 78.42
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `from`, `to`, or `amount` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/currency/timeframe

Returns exchange rates for every day within a specified date range.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `start_date` | Yes | string | Start date in `YYYY-MM-DD` format |
| `end_date` | Yes | string | End date in `YYYY-MM-DD` format |

**Postman Example**
```
GET {{baseUrl}}/v1/currency/timeframe?start_date=2025-01-01&end_date=2025-01-07
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Timeframe Rates": {
      "success": true,
      "start_date": "2025-01-01",
      "end_date": "2025-01-07",
      "quotes": {
        "2025-01-01": { "USDEUR": 0.89, "USDGBP": 0.77 },
        "2025-01-02": { "USDEUR": 0.90, "USDGBP": 0.78 }
      }
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `start_date` or `end_date` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/currency/change

Returns the margin and percentage rate of change for currencies between two dates.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `start_date` | Yes | string | Start date in `YYYY-MM-DD` format |
| `end_date` | Yes | string | End date in `YYYY-MM-DD` format |

**Postman Example**
```
GET {{baseUrl}}/v1/currency/change?start_date=2025-01-01&end_date=2025-01-31
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Changed Rates": {
      "success": true,
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "quotes": {
        "USDEUR": { "start_rate": 0.89, "end_rate": 0.91, "change": 0.02, "change_pct": 2.24 },
        "USDGBP": { "start_rate": 0.77, "end_rate": 0.78, "change": 0.01, "change_pct": 1.3 }
      }
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `start_date` or `end_date` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |


---

## 4. Public Holidays — `/v1/holiday`

**Upstream API:** [Nager.Date](https://date.nager.at/) — no API key required.

> **Note:** Holiday params (`year`, `countryCode`) are passed as **URL path segments**, not query parameters, by the `HolidayService`. The query params listed below are parsed by the controller and forwarded to the service, which builds the correct path internally (e.g. `PublicHolidays/2026/US`).

| Method | Endpoint | Required params |
|---|---|---|
| GET | `/v1/holiday/AvailableCountries` | None |
| GET | `/v1/holiday/PublicHolidays` | `year`, `countryCode` |
| GET | `/v1/holiday/NextPublicHolidays` | `countryCode` |
| GET | `/v1/holiday/NextPublicHolidaysWorldwide` | None |
| GET | `/v1/holiday/CountryInfo` | `countryCode` |
| GET | `/v1/holiday/LongWeekend` | `year`, `countryCode` |
| GET | `/v1/holiday/IsTodayPublicHoliday` | `countryCode` |

---

### GET /v1/holiday/AvailableCountries

Returns the full list of countries supported by the Nager.Date API.

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/AvailableCountries
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Available Countries": [
      { "countryCode": "AD", "name": "Andorra" },
      { "countryCode": "GH", "name": "Ghana" },
      { "countryCode": "US", "name": "United States" }
    ]
  }
}
```

---

### GET /v1/holiday/PublicHolidays

Returns all public holidays for a given country and year.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `year` | Yes | number | Four-digit year (e.g. `2026`) |
| `countryCode` | Yes | string | ISO 3166-1 alpha-2 country code (e.g. `US`, `GB`, `GH`) |

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/PublicHolidays?year=2026&countryCode=US
GET {{baseUrl}}/v1/holiday/PublicHolidays?year=2026&countryCode=GH
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Public Holidays": [
      {
        "date": "2026-01-01",
        "name": "New Year's Day",
        "countryCode": "US",
        "nationalHoliday": true,
        "subdivisionCodes": null,
        "holidayTypes": ["Public"]
      }
    ]
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `year` or `countryCode` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/holiday/NextPublicHolidays

Returns the upcoming public holidays for a given country.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `countryCode` | Yes | string | ISO 3166-1 alpha-2 country code |

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/NextPublicHolidays?countryCode=GB
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Next Public Holidays": [
      {
        "date": "2026-08-31",
        "name": "Summer Bank Holiday",
        "countryCode": "GB",
        "nationalHoliday": false,
        "subdivisionCodes": ["GB-ENG", "GB-WLS"],
        "holidayTypes": ["Public"]
      }
    ]
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `countryCode` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/holiday/NextPublicHolidaysWorldwide

Returns the next public holidays across all countries supported by the Nager.Date API.

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/NextPublicHolidaysWorldwide
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Next Public Holidays Worldwide": [
      {
        "date": "2026-07-17",
        "name": "Republic Day",
        "countryCode": "KR",
        "nationalHoliday": true,
        "holidayTypes": ["Public"]
      }
    ]
  }
}
```

---

### GET /v1/holiday/CountryInfo

Returns metadata about a country — full name, official languages, region, and border countries.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `countryCode` | Yes | string | ISO 3166-1 alpha-2 country code |

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/CountryInfo?countryCode=GH
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Country Info": {
      "commonName": "Ghana",
      "officialName": "Republic of Ghana",
      "countryCode": "GH",
      "region": "Africa",
      "borders": [
        { "commonName": "Ivory Coast", "countryCode": "CI" },
        { "commonName": "Burkina Faso", "countryCode": "BF" }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `countryCode` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/holiday/LongWeekend

Returns all long weekends (public holidays adjacent to a Saturday or Sunday) for a given country and year.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `year` | Yes | number | Four-digit year (e.g. `2026`) |
| `countryCode` | Yes | string | ISO 3166-1 alpha-2 country code |

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/LongWeekend?year=2026&countryCode=US
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Long Weekend": [
      {
        "startDate": "2026-05-23",
        "endDate": "2026-05-25",
        "dayCount": 3,
        "needBridgeDay": false
      }
    ]
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `year` or `countryCode` is missing |
| `404 Not Found` | Upstream returned no data |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/holiday/IsTodayPublicHoliday

Returns whether today is a public holiday in the given country. The upstream Nager.Date API responds with `HTTP 200` for yes and `HTTP 204` for no. The gateway normalises this into a boolean.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `countryCode` | Yes | string | ISO 3166-1 alpha-2 country code |

**Postman Example**
```
GET {{baseUrl}}/v1/holiday/IsTodayPublicHoliday?countryCode=US
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Is Today Public Holiday": true
  }
}
```
> Returns `true` if today is a public holiday, `false` if not.

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `countryCode` is missing |
| `500 Internal Server Error` | Upstream API request failed |


---

## 5. Sports — `/v1/sports`

**Upstream API:** [TheSportsDB](https://www.thesportsdb.com/api.php)

> **Note:** The TheSportsDB API key is embedded as a **path segment** in every request (e.g. `/{apiKey}/searchteams.php`). This is handled internally by `SportsService` — the API key is never exposed to the client.

| Method | Endpoint | Required params | Optional params |
|---|---|---|---|
| GET | `/v1/sports/searchTeams` | `t` | — |
| GET | `/v1/sports/searchEvents` | `e`, `s` | `s` (season) |
| GET | `/v1/sports/searchPlayers` | `p` | — |
| GET | `/v1/sports/searchVenues` | `v` | — |
| GET | `/v1/sports/lookUpLeague` | `id` | — |
| GET | `/v1/sports/lookUpTable` | `l` | `s` (season) |

---

### GET /v1/sports/searchTeams

Searches for sports teams by name.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `t` | Yes | string | Team name to search for (e.g. `Arsenal`) |

**Postman Example**
```
GET {{baseUrl}}/v1/sports/searchTeams?t=Arsenal
GET {{baseUrl}}/v1/sports/searchTeams?t=Real+Madrid
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Sports Teams": {
      "teams": [
        {
          "idTeam": "133604",
          "strTeam": "Arsenal",
          "strTeamBadge": "https://www.thesportsdb.com/images/media/team/badge/...",
          "strSport": "Soccer",
          "strLeague": "English Premier League",
          "idLeague": "4328",
          "strCountry": "England",
          "strStadium": "Emirates Stadium",
          "strDescriptionEN": "Arsenal Football Club is a professional football club...",
          "intFormedYear": "1886"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `t` is missing |
| `404 Not Found` | No teams found |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/sports/searchEvents

Searches for sports events by event name, optionally filtered by season.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `e` | Yes | string | Event name to search for (e.g. `Arsenal_vs_Chelsea`) |
| `s` | Yes | string | Season to filter by (e.g. `2024-2025`) |

> **Note:** Both `e` and `s` are validated as required by the controller. Supply both params for reliable results.

**Postman Example**
```
GET {{baseUrl}}/v1/sports/searchEvents?e=Arsenal_vs_Chelsea&s=2024-2025
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Sports Events": {
      "events": [
        {
          "idEvent": "1234567",
          "strEvent": "Arsenal vs Chelsea",
          "strSport": "Soccer",
          "idLeague": "4328",
          "strLeague": "English Premier League",
          "strSeason": "2024-2025",
          "strHomeTeam": "Arsenal",
          "strAwayTeam": "Chelsea",
          "intHomeScore": "2",
          "intAwayScore": "1",
          "dateEvent": "2024-10-05",
          "strTime": "12:30:00",
          "strVenue": "Emirates Stadium",
          "strStatus": "Match Finished"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `e` or `s` is missing |
| `404 Not Found` | No events found |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/sports/searchPlayers

Searches for players by name.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `p` | Yes | string | Player name to search for (e.g. `Bukayo Saka`) |

**Postman Example**
```
GET {{baseUrl}}/v1/sports/searchPlayers?p=Bukayo+Saka
GET {{baseUrl}}/v1/sports/searchPlayers?p=Mohamed+Salah
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Team Players": {
      "player": [
        {
          "idPlayer": "34146937",
          "strPlayer": "Bukayo Saka",
          "idTeam": "133604",
          "strTeam": "Arsenal",
          "strSport": "Soccer",
          "strNationality": "England",
          "dateBorn": "2001-09-05",
          "strPosition": "Winger",
          "strThumb": "https://www.thesportsdb.com/images/media/player/thumb/...",
          "strDescriptionEN": "Bukayo Saka is an English professional footballer..."
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `p` is missing |
| `404 Not Found` | No players found |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/sports/searchVenues

Searches for sports venues by name.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `v` | Yes | string | Venue name to search for (e.g. `Emirates`) |

**Postman Example**
```
GET {{baseUrl}}/v1/sports/searchVenues?v=Emirates
GET {{baseUrl}}/v1/sports/searchVenues?v=Old+Trafford
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Sports Venues": {
      "venues": [
        {
          "idVenue": "15269",
          "strVenue": "Emirates Stadium",
          "strCountry": "England",
          "strLocation": "London",
          "intCapacity": "60704"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `v` is missing |
| `404 Not Found` | No venues found |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/sports/lookUpLeague

Looks up details for a specific league by its TheSportsDB league ID.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `id` | Yes | string | TheSportsDB league ID (e.g. `4328` for English Premier League) |

**Postman Example**
```
GET {{baseUrl}}/v1/sports/lookUpLeague?id=4328
GET {{baseUrl}}/v1/sports/lookUpLeague?id=4335
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Sports League(s)": {
      "leagues": [
        {
          "idLeague": "4328",
          "strLeague": "English Premier League",
          "strSport": "Soccer",
          "strCountry": "England",
          "strBadge": "https://www.thesportsdb.com/images/media/league/badge/...",
          "strDescriptionEN": "The Premier League is the top level of the English football league system..."
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `id` is missing |
| `404 Not Found` | No league found |
| `500 Internal Server Error` | Upstream API request failed |

---

### GET /v1/sports/lookUpTable

Looks up the league standings table for a given league, optionally filtered by season.

**Query Parameters**

| Parameter | Required | Type | Description |
|---|---|---|---|
| `l` | Yes | string | TheSportsDB league ID (e.g. `4328`) |
| `s` | No | string | Season to filter by (e.g. `2024-2025`). Defaults to current season. |

**Postman Example**
```
GET {{baseUrl}}/v1/sports/lookUpTable?l=4328
GET {{baseUrl}}/v1/sports/lookUpTable?l=4328&s=2024-2025
```

**Successful Response** `200 OK`
```json
{
  "message": "Data fetched successfully",
  "details": {
    "Sports Table(s)": {
      "table": [
        {
          "idTeam": "133604",
          "strTeam": "Arsenal",
          "strBadge": "https://www.thesportsdb.com/images/media/team/badge/...",
          "intRank": "1",
          "intPlayed": "38",
          "intWin": "28",
          "intDraw": "5",
          "intLoss": "5",
          "intPoints": "89"
        }
      ]
    }
  }
}
```

**Error Responses**
| Status | Reason |
|---|---|
| `400 Bad Request` | `l` is missing |
| `404 Not Found` | No table data found |
| `500 Internal Server Error` | Upstream API request failed |

---

## 6. Aviation — `/v1/aviation`

**Upstream API:** [Aviationstack](https://aviationstack.com/)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/aviation/flights` | Retrieve current flights |
| GET | `/v1/aviation/flights/pasts` | Retrieve past flights |
| GET | `/v1/aviation/flights/schedules` | Retrieve flight schedules |
| GET | `/v1/aviation/flights/futures` | Retrieve future flights |
| GET | `/v1/aviation/airports` | Retrieve airports information |
| GET | `/v1/aviation/airlines` | Retrieve airlines information |
| GET | `/v1/aviation/aircraft/types` | Retrieve aircraft types |
| GET | `/v1/aviation/aircraft/registration` | Retrieve aircraft registrations |
| GET | `/v1/aviation/flights/cities` | Retrieve cities |
| GET | `/v1/aviation/flights/countries` | Retrieve countries |
| GET | `/v1/aviation/flights/taxes` | Retrieve flight taxes |

---

## 7. Agriculture — `/v1/argo`

**Upstream API:** [Agromonitoringstack](https://agromonitoring.com/)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/argo/polygons` | Create a new polygon |
| GET | `/v1/argo/polygons` | Retrieve all polygons |
| GET | `/v1/argo/polygons/specific` | Retrieve a specific polygon by ID |
| DELETE | `/v1/argo/polygons/delete` | Delete a specific polygon by ID |
| DELETE | `/v1/argo/polygons/history` | Clear polygon history |
| GET | `/v1/argo/polygons/weather` | Retrieve current weather for a polygon |
| GET | `/v1/argo/polygons/weather/history` | Retrieve historical weather for a polygon |
| GET | `/v1/argo/polygons/uvi/history` | Retrieve historical UVI for a polygon |
| GET | `/v1/argo/polygons/uvi/forecast` | Retrieve UVI forecast for a polygon |
| GET | `/v1/argo/polygons/accumulated-temperature` | Retrieve accumulated temperature |
| GET | `/v1/argo/polygons/accumulated-precipitation` | Retrieve accumulated precipitation |
| GET | `/v1/argo/polygons/nvdi/history` | Retrieve NDVI history |
