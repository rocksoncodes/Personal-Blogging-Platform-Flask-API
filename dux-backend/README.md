# Universal API Gateway 

An API gateway for public services built on Express 5 and TypeScript. The gateway aggregates seven public APIs weather, news, currency, public holidays, sports, aviation, and agriculture behind a single, versioned interface mounted at `/v1`. Secrets and runtime configuration are managed via [Infisical](https://infisical.com/) no API keys are stored locally beyond the five credentials needed to bootstrap the Infisical connection.

## Features

- Express 5 server written in TypeScript (ESM, `"type": "module"`)
- Versioned API routes under `/v1`
- Layered architecture: `AxiosHttpClient` → service → controller → router, with constructor-injected dependencies
- Config split into two typed objects: `SystemConfig` (server/logger settings) and `ModuleConfig` (per-module API keys and URLs)
- Secrets management via Infisical SDK zero secrets in source control
- Shared `AxiosHttpClient` and `ControllerResponseHandler` used across all modules
- API Key authentication and Rate Limiting (100 req/15 min) via Gateway Middleware
- PostgreSQL database integration via Prisma for securely hashing and storing API keys
- Structured JSON logging via Winston, with Morgan piped through it
- Eight fully implemented modules: **Auth**, **Weather**, **News**, **Currency**, **Public Holidays**, **Sports**, **Aviation**, **Agriculture**

## External APIs

| API | Purpose | Status |
|---|---|---|
| [OpenWeatherMap](https://openweathermap.org/api) | Current weather and 5-day forecast | Implemented |
| [NewsAPI](https://newsapi.org/) | News headlines and topic search | Implemented |
| [Currencylayer](https://currencylayer.com/) | Live and historical exchange rates | Implemented |
| [Nager.Date](https://date.nager.at/) | Public holidays by country | Implemented |
| [TheSportsDB](https://www.thesportsdb.com/api.php) | Teams, players, events, leagues | Implemented |
| [Aviationstack](https://aviationstack.com/) | Real-time flights, schedules, and airports | Implemented |
| [Agromonitoringstack](https://agromonitoring.com/) | Agricultural polygons, soil, and weather data | Implemented |

Each integration follows the same modular provider / service / controller / router pattern. API keys and base URLs are stored in Infisical and injected at startup.

## Requirements

- Node.js 20+
- yarn
- PostgreSQL database
- An [Infisical](https://infisical.com/) project containing the runtime secrets listed in the [Setup](#setup) section

## Setup

**1. Clone the repository:**
```bash
git clone https://github.com/michaelrockson/Universal-API-Gateway.git
cd Universal-API-Gateway
```

**2. Install dependencies:**
```bash
yarn install
```

**3. Create a `.env` file in the project root** with your Infisical bootstrap credentials:
```env
INFISICAL_SITE_URL=https://app.infisical.com
INFISICAL_CLIENT_ID=<your-client-id>
INFISICAL_CLIENT_SECRET=<your-client-secret>
INFISICAL_ENVIRONMENT=dev
INFISICAL_PROJECT_ID=<your-project-id>
```

These five values are the only secrets that live locally. Everything else is fetched from Infisical at startup.

> **Note for Local DB Setup:** To run Prisma CLI commands locally (like `prisma migrate dev`), you must also add your `DATABASE_URL` to the `.env` file. However, the runtime server will fetch `DATABASE_URL` securely from Infisical.

**4. Add the following secrets to your Infisical project:**

*System config:*
```
PORT
ENVIRONMENT
LOG_LEVEL
```

*Module config:*
```
WEATHER_API_URL
WEATHER_API_KEY
NEWS_API_URL
NEWS_API_KEY
CURRENCY_API_URL
CURRENCY_API_KEY
HOLIDAY_API_URL
SPORTS_API_URL
SPORTS_API_KEY
AVIATION_API_URL
AVIATION_API_KEY
AGRO_API_URL
AGRO_API_URL
AGRO_API_KEY
DATABASE_URL
```

See the [Environment Variables](#environment-variables) section for the purpose of each key.

**5. Initialize Database:**
```bash
yarn prisma migrate dev
```

## Running Locally

### Development
```bash
yarn dev
```
Uses `tsx watch` for live reloading. The server listens on the port configured in Infisical (`PORT`), defaulting to `3000`.

### Production Build
```bash
yarn build
yarn start
```

> **Important:** Always run the server from the **project root**, not from `src/`. The dotenv bootstrap resolves `.env` relative to `process.cwd()`. Running from a subdirectory will cause a `Missing required environment variable: INFISICAL_SITE_URL` error at startup.

## API & Testing

All endpoints are documented in **[docs/Routes.md](docs/Routes.md)**, including full parameter tables and ready-to-use Postman examples for every module.

Base URL for local testing: `http://localhost:3000`

> **Note:** Except for `/v1/auth/gateway-key`, all routes require a valid API key passed via the `x-api-key` or `Authorization` (Bearer) header.

| Module | Base path |
|---|---|
| Auth | `/v1/auth` |
| Weather | `/v1/weather` |
| News | `/v1/news` |
| Currency | `/v1/currency` |
| Public Holidays | `/v1/holiday` |
| Sports | `/v1/sports` |
| Aviation | `/v1/aviation` |
| Agriculture | `/v1/argo` |

## Project Structure

```
src/
├── server.ts                            # Entry point — bootstrap and startup
│
├── modules/                             # Feature modules (one folder per domain)
│   ├── controllers.registry.ts          # Calls all providers → assembles GatewayControllers
│   ├── routes.registry.ts               # Mounts all module routers under /v1
│   │
│   ├── weather/
│   │   ├── weather.provider.ts          # Factory: AxiosHttpClient → WeatherService → WeatherController
│   │   ├── weather.service.ts           # Outbound calls to OpenWeatherMap
│   │   ├── weather.controller.ts        # HTTP request handling for /v1/weather
│   │   ├── weather.routes.ts            # Route definitions
│   │   └── weather.types.ts             # Request param and response types
│   │
│   ├── auth/                            # API Key generation (Prisma)
│   ├── news/                            # NewsAPI integration
│   ├── currency/                        # Currencylayer integration
│   ├── holidays/                        # Nager.Date integration
│   ├── sports/                          # TheSportsDB integration
│   ├── aviation/                        # Aviationstack integration
│   └── agriculture/                     # Agromonitoringstack integration
│
├── bootstrap/                           # Startup configuration and injection
│   ├── envs/                            # System and Module environment parsing
│   ├── providers/                       # Infisical auth & secret injection
│   ├── bootstrap.types.ts               # SharedDependencies, GatewayControllers, ModuleControllersProvider
│   └── bootstrap.utils.ts               # bootGatewayControllers, getEnvVar, validateEnvs, etc.
│
└── app/                                 # Cross-cutting infrastructure
    ├── db/
    │   └── prisma.ts                    # PrismaClient factory
    ├── http/
    │   ├── clients/                     # AxiosHttpClient (implements IHttpClient)
    │   ├── handlers/                    # ControllerResponseHandler (implements IResponseHandler)
    │   └── request.utils.ts             # Error classes (e.g. BadRequestError), validation, and parsing
    │
    ├── middleware/                      # Rate limiting & Postgres-based Auth logic
    │
    ├── interfaces/
    │   ├── config/                      # Per-concern config interfaces (ISystemConfig, IModuleConfig, etc.)
    │   └── infrastructure/              # IHttpClient, ILogger, IResponseHandler
    │
    └── logger/
        ├── logger.utils.ts              # logProcess, logBootstrapStep, createMorganStream, consoleLogger
        └── winston.logger.ts            # WinstonLogger (implements ILogger)
```

## Architecture

The gateway uses a layered architecture with constructor-injected dependencies. The startup sequence in `server.ts` enforces a strict initialization order:

1. **Infisical bootstrap** `bootstrapSecrets()` authenticates with Infisical and injects all runtime secrets into `process.env`, returning two typed config objects.
2. **Config construction** `new SystemConfig(systemConfig)` and `new ModuleConfig(moduleConfig)` create immutable, typed config snapshots.
3. **Infrastructure setup** `WinstonLogger`, `ControllerResponseHandler`, and `PrismaClient` are instantiated from the system config.
4. **Controller boot** `bootGatewayControllers(sharedDependencies)` calls each module's provider function, which constructs its own `AxiosHttpClient`, service, and controller. All controllers are validated before the server starts.
5. **Router mount** `useGatewayRouters(controllers, middleware)` passes each controller into its module's router factory and mounts them all under `/v1` (protected by rate limiting and API key auth).
6. **Server start** `server.listen(port)`.

No service or controller is instantiated at module load time. All construction happens inside provider functions, which only run after the config objects are ready.

See **[docs/Architecture.md](docs/Architecture.md)** for a full breakdown of the startup sequence, dependency flow, type system, and step-by-step instructions for adding a new module.

## Notes

- All API keys and base URLs are stored in Infisical, not in `.env`.
- The `.env` file contains **only** the five Infisical bootstrap credentials.
- All modules share the same `AxiosHttpClient` and `ControllerResponseHandler` no module makes raw Axios calls or implements its own response formatting.
- The Sports API key is embedded as a **path segment** (not a query param), so `SportsService` receives the key as a second constructor argument and builds the endpoint string itself.
- When adding a new module, follow the 13-step guide in [docs/Architecture.md](docs/Architecture.md#14-adding-a-new-module).

## Environment Variables

### Local `.env` (bootstrap only)

| Variable | Purpose |
|---|---|
| `INFISICAL_SITE_URL` | Infisical instance URL |
| `INFISICAL_CLIENT_ID` | Universal auth client ID |
| `INFISICAL_CLIENT_SECRET` | Universal auth client secret |
| `INFISICAL_ENVIRONMENT` | Target environment (`dev`, `staging`, `prod`) |
| `INFISICAL_PROJECT_ID` | Infisical project to fetch secrets from |

### Infisical secrets (runtime)

**System config** controls server and logger behaviour:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server listen port |
| `ENVIRONMENT` | `"dev"` | App environment label; controls log file output and error verbosity |
| `LOG_LEVEL` | `"info"` | Winston log level |

**Module config** API credentials for each feature module:

| Variable | Purpose |
|---|---|
| `WEATHER_API_URL` | OpenWeatherMap base URL |
| `WEATHER_API_KEY` | OpenWeatherMap API key (sent as `appid` query param) |
| `NEWS_API_URL` | NewsAPI base URL |
| `NEWS_API_KEY` | NewsAPI key |
| `CURRENCY_API_URL` | Currencylayer base URL |
| `CURRENCY_API_KEY` | Currencylayer key (sent as `access_key` query param) |
| `HOLIDAY_API_URL` | Nager.Date base URL (no key required) |
| `SPORTS_API_URL` | TheSportsDB base URL |
| `SPORTS_API_KEY` | TheSportsDB API key (embedded as a path segment) |
| `AVIATION_API_URL` | Aviationstack base URL |
| `AVIATION_API_KEY` | Aviationstack API key |
| `AGRO_API_URL` | Agromonitoringstack base URL |
| `AGRO_API_KEY` | Agromonitoringstack API key |
| `AGRO_POLYGON_ID` | Agromonitoringstack polygon ID |

## License

MIT
