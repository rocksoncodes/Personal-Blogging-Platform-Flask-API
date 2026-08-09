# API Gateway Architecture Guide

A reference for any developer picking up this codebase. Covers the startup
sequence, dependency flow, module structure, the resource registration pattern,
the shared type system, and the conventions to follow when adding new modules.


## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Startup Sequence](#4-startup-sequence)
5. [Dependency Flow](#5-dependency-flow)
6. [Secrets & Configuration](#6-secrets--configuration)
7. [Dependency Injection Pattern](#7-dependency-injection-pattern)
8. [Resource Registration Pattern](#8-resource-registration-pattern)
9. [Module Structure](#9-module-structure)
10. [Bootstrap & App Layers](#10-bootstrap--app-layers)
11. [Interface Layer](#11-interface-layer)
12. [Type System](#12-type-system)
13. [Available Routes](#13-available-routes)
14. [Adding a New Module](#14-adding-a-new-module)
15. [Environment Variables](#15-environment-variables)


## 1. Project Overview

Dux API Gateway is a TypeScript/Express API gateway that
aggregates seven third-party public data APIs weather, news, currency,
holidays, sports, aviation, and agriculture behind a single, unified interface mounted at `/v1`.

Secrets management is handled by Infisical. No API keys or runtime
configuration are stored locally in `.env`; `.env` contains only the five
credentials needed to reach Infisical itself.

Shared infrastructure (`SystemConfig`, `ModuleConfig`, `WinstonLogger`,
`ControllerResponseHandler`) is instantiated once in `server.ts` and
propagated downward via a `SharedDependencies` object no singletons,
no module-level state.

Configuration is intentionally split into two typed objects:
- **`ISystemConfig`** server & logger settings (`port`, `environment`, `logLevel`)
- **`IModuleConfig`** per-module API URLs and keys

This split means providers can read only the config slice they need without
being handed the full config bag.


## 2. Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Language | TypeScript 6, strict mode, `NodeNext` modules |
| Framework | Express 5 |
| Secrets | Infisical SDK (`@infisical/sdk`) |
| HTTP client | Axios (via `AxiosHttpClient` implementing `IHttpClient`) |
| Logging | Winston (wrapped in `WinstonLogger` implementing `ILogger`) |
| Request logging | Morgan (piped through `WinstonLogger` via `createMorganStream`) |
| Local env loading | dotenv |
| Dev server | `tsx watch` |


## 3. Directory Structure

```
src/
├── server.ts                            # Entry point bootstrap and startup
│
├── modules/                             # Feature modules (one folder per domain)
│   ├── controllers.registry.ts          # Calls all providers → assembles GatewayControllers
│   ├── routes.registry.ts               # Mounts all module routers under /v1
│   │
│   ├── weather/
│   │   ├── weather.provider.ts          # Factory: AxiosHttpClient → WeatherService → WeatherController
│   │   ├── weather.service.ts
│   │   ├── weather.controller.ts
│   │   ├── weather.routes.ts
│   │   └── weather.types.ts
│   │
│   ├── news/
│   │   ├── news.provider.ts
│   │   ├── news.service.ts
│   │   ├── news.controller.ts
│   │   ├── news.routes.ts
│   │   └── news.types.ts
│   │
│   ├── currency/
│   │   ├── currency.provider.ts
│   │   ├── currency.service.ts
│   │   ├── currency.controller.ts
│   │   ├── currency.routes.ts
│   │   └── currency.types.ts
│   │
│   ├── holidays/
│   │   ├── holiday.provider.ts
│   │   ├── holiday.service.ts
│   │   ├── holiday.controller.ts
│   │   ├── holiday.routes.ts
│   │   └── holiday.types.ts
│   │
│   ├── sports/
│   │   ├── sports.provider.ts
│   │   ├── sports.service.ts
│   │   ├── sports.controller.ts
│   │   ├── sports.routes.ts
│   │   └── sports.types.ts
│   │
│   ├── aviation/
│   │   ├── aviation.provider.ts
│   │   ├── aviation.service.ts
│   │   ├── aviation.controller.ts
│   │   ├── aviation.routes.ts
│   │   └── aviation.types.ts
│   │
│   └── agriculture/
│       ├── argo.provider.ts
│       ├── agro.service.ts
│       ├── agro.controller.ts
│       ├── agro.routes.ts
│       └── agro.types.ts
│
├── bootstrap/                           # Startup configuration and injection
│   ├── envs/                            # System and Module environment parsing
│   │   ├── module.envs.ts          # ModuleConfig class (implements IModuleConfig)
│   │   └── system.envs.ts          # SystemConfig class (implements ISystemConfig)
│   ├── providers/                       # Providers
│   │   └── infisical.provider.ts       # injectSecretsFromInfisical() — Infisical auth & secret injection
│   ├── bootstrap.types.ts               # SharedDependencies, GatewayControllers, ModuleControllersProvider
│   └── bootstrap.utils.ts               # bootGatewayControllers(), getEnvVar/Number, validateEnvs, etc.
│
└── app/                                 # Cross-cutting infrastructure
    ├── db/
    │   └── prisma.ts                    # PrismaClient factory
    ├── http/
    │   ├── clients/                     # HTTP clients
    │   │   └── axios.client.ts              # AxiosHttpClient (implements IHttpClient)
    │   ├── handlers/                    # Response handlers
    │   │   └── response.handler.ts          # ControllerResponseHandler (implements IResponseHandler)
    │   └── request.utils.ts             # Error classes (e.g. BadRequestError), validation, and parsing
    │
    ├── middleware/
    │   ├── middleware.provider.ts       # GatewayMiddleware provider
    │   ├── middleware.repository.ts     # Postgres API Key validation
    │   └── middleware.service.ts        # Rate limiting and Auth logic
    │
    ├── interfaces/
    │   ├── config/                      # Per-concern config interfaces
    │   │   ├── index.interface.ts      # Composes ISystemConfig & IModuleConfig from sub-interfaces
    │   │   ├── system/
    │   │   └── modules/
    │   │
    │   └── infrastructure/              # Cross-cutting infrastructure contracts
    │       ├── http.interface.ts        # IHttpClient
    │       ├── logger.interface.ts      # ILogger
    │       └── response.handler.interface.ts  # IResponseHandler
    │
    └── logger/
        ├── logger.utils.ts              # logProcess / logBootstrapStep / logInboundRaw / createMorganStream / consoleLogger
        └── winston.logger.ts            # WinstonLogger class (implements ILogger)
```


## 4. Startup Sequence

Everything flows through `startServer()` in `server.ts`. Each step depends
on the previous one completing successfully.

```
startServer()
│
├── 1. bootstrapSecrets()
│         Reads the five Infisical bootstrap variables from the local .env via
│         dotenv.config(). Authenticates with the Infisical SDK using
│         universal auth, calls listSecrets() with attachToProcessEnv: true,
│         injecting all runtime secrets into process.env. Maps the resolved
│         values into two typed objects systemConfig and moduleConfig
│         and returns { systemConfig, moduleConfig }.
│
├── 2. new SystemConfig(serverSecrets.systemConfig)
│         Constructs a SystemConfig instance (implements ISystemConfig)
│         from the returned systemConfig object. Holds readonly values for
│         environment, port and logLevel.
│
├── 3. new ModuleConfig(serverSecrets.moduleConfig)
│         Constructs a ModuleConfig instance (implements IModuleConfig)
│         from the returned moduleConfig object. Holds readonly API URLs
│         and keys for all five feature modules.
│
├── 4. new WinstonLogger(systemConfig)
│         Constructs a WinstonLogger (implements ILogger). Accepts an
│         ILoggerConfig (satisfied by SystemConfig). Console transport
│         is always active; file transports are added only when
│         environment === "prod".
│
├── 5. new ControllerResponseHandler(systemConfig.environment)
│         Constructs the shared response handler (implements IResponseHandler).
│         Takes the environment string directly to determine error verbosity
│         in non-2xx responses.
│
├── 6. providePrismaClient(systemConfig.databaseUrl)
│         Constructs the PrismaClient for database interactions (PostgreSQL).
│
├── 7. bootGatewayControllers(sharedDependencies)
│         Packages the five shared instances into a SharedDependencies object
│         ({ systemConfig, moduleConfig, logger, responseHandler, prismaClient }) and calls
│         registerGatewayControllers(deps), which invokes each module's
│         provider function. Each provider constructs its AxiosHttpClient,
│         Service and Controller using the injected deps.
│         validateGatewayControllers() asserts all controller instances are
│         truthy before returning GatewayControllers.
│
├── 8. useGatewayRouters(controllers, middleware)
│         Receives the live GatewayControllers map and GatewayMiddleware. Passes each controller
│         into its module's router factory, mounts all routers under /v1 (protected by auth
│         and rate-limiting), and returns the configured Express Router.
│
└── 9. server.listen(port)
          Server is live. Incoming requests flow:
          Express → gatewayRouter → module router → controller → service.
```


## 5. Dependency Flow

Dependencies flow strictly top-down. No layer reaches up into a layer above it.

```
dotenv (.env)
    │
    ▼
injectSecretsFromInfisical()     (Infisical SDK — injects runtime secrets into process.env)
    │
    ├─────────────────────────────────────┐
    ▼                                     ▼
SystemConfig                   ModuleConfig
(ISystemConfig)                   (IModuleConfig)
    │                                     │
    ├──────────────┐                      │
    ▼              ▼                      │
WinstonLogger   ControllerResponseHandler │
(ILogger)       (IResponseHandler)        │
    │               │                     │
    └───────┬────────┘                    │
            ▼                             │
     SharedDependencies ←─────────────────┘
     { systemConfig, moduleConfig, logger, responseHandler, prismaClient }
            │
            ▼
     Provider functions        (construct AxiosHttpClient → Service → Controller)
            │
            ▼
     controllers.registry.ts   (registerGatewayControllers → validates → GatewayControllers)
            │
            ▼
     bootstrap.utils.ts        (bootGatewayControllers wraps error handling)
            │
            ▼
     routes.registry.ts        (useGatewayRouters → mounts module routers)
            │
            ▼
     Express Server
```

Key rules enforced by this flow:

- A service never knows a controller exists.
- A controller never knows which route mounted it.
- A router never knows how the server bootstrapped.
- Services must **never** be instantiated at module load time. All
  instantiation happens inside provider functions, which are called
  only after `SystemConfig` and `ModuleConfig` have been constructed.
- No module reads `process.env` directly; all config is accessed through
  the injected `ISystemConfig` (`deps.systemConfig`) or `IModuleConfig`
  (`deps.moduleConfig`).


## 6. Secrets & Configuration

### Two-step bootstrap

**Step 1 Local `.env` (Infisical credentials only)**

The local `.env` contains only these five values, read by dotenv on startup
via `dotenv.config({ path: path.join(process.cwd(), ".env") })` inside
`infisical.provider.ts`:

```
INFISICAL_SITE_URL
INFISICAL_CLIENT_ID
INFISICAL_CLIENT_SECRET
INFISICAL_ENVIRONMENT
INFISICAL_PROJECT_ID
```

**Step 2 Remote secrets (from Infisical)**

`injectSecretsFromInfisical()` authenticates via universal auth, calls
`listSecrets()` with `attachToProcessEnv: true`, then reads the
now-populated `process.env` values into two typed objects:

```typescript
const systemConfig = {
  environment: getEnvVar("ENVIRONMENT", "dev"),
  port:        getEnvNumber("PORT", 3000),
  logLevel:    getEnvVar("LOG_LEVEL", "info"),
} as const;

const moduleConfig = {
  weatherApiUrl:  getEnvVar("WEATHER_API_URL", ""),
  weatherApiKey:  getEnvVar("WEATHER_API_KEY", ""),
  newsApiUrl:     getEnvVar("NEWS_API_URL", ""),
  newsApiKey:     getEnvVar("NEWS_API_KEY", ""),
  currencyApiUrl: getEnvVar("CURRENCY_API_URL", ""),
  currencyApiKey: getEnvVar("CURRENCY_API_KEY", ""),
  holidayApiUrl:  getEnvVar("HOLIDAY_API_URL", ""),
  sportsApiUrl:   getEnvVar("SPORTS_API_URL", ""),
  sportsApiKey:   getEnvVar("SPORTS_API_KEY", ""),
  aviationApiUrl: getEnvVar("AVIATION_API_URL", ""),
  aviationApiKey: getEnvVar("AVIATION_API_KEY", ""),
  agroApiUrl:     getEnvVar("AGRO_API_URL", ""),
  agroApiKey:     getEnvVar("AGRO_API_KEY", ""),
  agroPolygonId:  getEnvVar("AGRO_POLYGON_ID", ""),
} as const;
```

`validateInfisicalSecrets()` checks for missing keys, logs the count of
injected secrets, and throws if any required value is absent.

### Accessing config in modules

Always read from the injected `deps.moduleConfig`, never from `process.env`
directly:

```typescript
// correct — inside a provider function
const weatherHttpClient = new AxiosHttpClient(
  deps.moduleConfig.weatherApiUrl,
  deps.moduleConfig.weatherApiKey,
  "appid",
);

// avoid
const weatherHttpClient = new AxiosHttpClient(
  process.env.WEATHER_API_URL!,
  process.env.WEATHER_API_KEY!,
  "appid",
);
```

### Working directory note

`dotenv` resolves `.env` relative to `process.cwd()`, not relative to
`server.ts`. Always run the server from the project root. Running from
`src/` will cause dotenv to find no vars and the Infisical bootstrap will
fail with `Missing required environment variable: INFISICAL_SITE_URL`.


## 7. Dependency Injection Pattern

`server.ts` constructs four shared infrastructure objects and bundles them
into a `SharedDependencies` struct, which is then threaded through the
entire bootstrap chain:

```typescript
const systemConfig    = new SystemConfig(serverSecrets.systemConfig);   // ISystemConfig
const moduleConfig    = new ModuleConfig(serverSecrets.moduleConfig);   // IModuleConfig
const logger          = new WinstonLogger(systemConfig);                   // ILogger
const responseHandler = new ControllerResponseHandler(systemConfig.environment); // IResponseHandler
const prismaClient    = providePrismaClient(systemConfig.databaseUrl); // PrismaClient

const sharedDependencies: SharedDependencies = {
  systemConfig,
  moduleConfig,
  logger,
  responseHandler,
  prismaClient,
};
```

**Provider functions** receive `deps: SharedDependencies` and use it to:
1. Construct an `AxiosHttpClient` with the appropriate URL and key from `deps.moduleConfig`.
2. Construct the module's `Service`, passing the `AxiosHttpClient`.
3. Construct the module's `Controller`, passing the `Service` and `deps.responseHandler`.
4. Return a typed `ModuleControllersProvider` discriminated union member.

```typescript
// weather/weather.provider.ts
export function provideWeatherController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "weather" }> {
  const weatherHttpClient = new AxiosHttpClient(
    deps.moduleConfig.weatherApiUrl,
    deps.moduleConfig.weatherApiKey,
    "appid",
  );
  const weatherService    = new WeatherService(weatherHttpClient);
  const weatherController = new WeatherController(weatherService, deps.responseHandler);
  return { name: "weather", controller: weatherController };
}
```

This pattern means:
- No module ever imports `SystemConfig`, `ModuleConfig`, `WinstonLogger`,
  or `ControllerResponseHandler` directly.
- All cross-cutting concerns are swappable behind interfaces.
- Testing a module only requires a mock `SharedDependencies`.

> **Note on SportsService**: The sports provider also passes `deps.moduleConfig.sportsApiKey`
> as a second constructor argument to `SportsService`. The sports API embeds the key
> as a path segment (e.g. `/{apiKey}/searchteams.php`) rather than a query param, so
> the service builds the endpoint string itself from the stored key.


## 8. Resource Registration Pattern

The gateway uses a **provider → registry → validation → boot** pattern to
instantiate and validate all module controllers before the server starts
accepting requests.

### Step-by-step

```
provideXxxController(deps)        — module-level factory, receives SharedDependencies
    ↓
{ name, controller }              — typed as a ModuleControllersProvider discriminated union member
    ↓
registerGatewayControllers(deps)  — calls all providers, assembles GatewayControllers map,
                                    calls validateGatewayControllers(logger, controllers)
    ↓
bootGatewayControllers(deps)      — wraps registerGatewayControllers() in error handling,
                                    re-throws after logging on failure
    ↓
GatewayControllers                — passed directly to useGatewayRouters()
```

### Provider functions

Each module exports a provider factory with a narrowed return type using
`Extract<ModuleControllersProvider, { name: "..." }>`:

```typescript
// holidays/holiday.provider.ts
export function provideHolidayController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "holiday" }> {
  const holidayHttpClient = new AxiosHttpClient(
    deps.moduleConfig.holidayApiUrl,
    "",   // Nager.Date requires no API key
    "",
  );
  const holidayService    = new HolidayService(holidayHttpClient);
  const holidayController = new HolidayController(holidayService, deps.responseHandler);
  return { name: "holiday", controller: holidayController };
}
```

The narrowed return type ensures TypeScript knows the concrete
`HolidayController` type rather than the full `ModuleControllersProvider` union.

### Controller registry

`registerGatewayControllers()` calls each provider with `deps`, destructures
the result, and assembles the typed `GatewayControllers` map:

```typescript
const gatewayControllerRegistry: GatewayControllers = {
  weatherController:  weather.controller,
  newsController:     news.controller,
  currencyController: currency.controller,
  holidayController:  holiday.controller,
  sportsController:   sports.controller,
};
```

`validateGatewayControllers(deps.logger, gatewayControllerRegistry)` iterates
the map and throws if any entry is falsy, logging a bootstrap success message
if all controllers are present.


## 9. Module Structure

Each feature module follows a five-file structure:

```
module.provider.ts    — Factory: creates AxiosHttpClient → service → controller, returns typed pair
module.service.ts     — Outbound HTTP calls to the third-party API
module.controller.ts  — Receives HTTP requests, delegates to service via IResponseHandler
module.routes.ts      — Defines routes, exported as a factory function
module.types.ts       — TypeScript interfaces for request params and API response shapes
```

### Provider

Receives `SharedDependencies`, constructs the `AxiosHttpClient` (with the
appropriate base URL, API key, and key param name from `deps.moduleConfig`),
creates the service and controller, and returns them as a named pair keyed
on `name`. This is the only place where `new XxxService()` and `new
XxxController()` are called. See [Section 7](#7-dependency-injection-pattern) for details.

### Service

Owns all outbound HTTP communication with the upstream API. It receives an `IHttpClient` via its constructor.

```typescript
export class WeatherService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }
  
  async getCurrentWeather(params: CurrentWeatherParams) {
    try {
      const response = await this.httpClient.makeApiRequest("weather", params);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
  async getWeatherForecast(params: CurrentWeatherParams) {
    try {
      const response = await this.httpClient.makeApiRequest("forecast", params);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
```

### Controller

Receives its service via constructor injection **and** the shared
`IResponseHandler` (sourced from `deps.responseHandler` in the provider).
Delegates all request lifecycle concerns (param parsing, validation, error
catching, JSON formatting) to `IResponseHandler` via `handleRequest()`.

```typescript
export class WeatherController {
  private readonly httpClient: WeatherService;
  private readonly responseHandler: IResponseHandler;

  constructor(weatherService: WeatherService, responseHandler: IResponseHandler) {
    this.httpClient      = weatherService;
    this.responseHandler = responseHandler;
  }

  async handleCurrentWeatherRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req, res,
      (params) => this.httpClient.getCurrentWeather(params),
      "currentWeather",
      ["lat", "lon"],
    );
  }
}
```

### Routes

Exported as a factory function never a module-level router instance.
Receives the controller instance as its only argument.

```typescript
export function provideWeatherRouter(weatherController: WeatherController): Router {
  const weatherRouter = Router();
  weatherRouter.get("/current",  async (req, res) => { await weatherController.handleCurrentWeatherRequest(req, res); });
  weatherRouter.get("/forecast", async (req, res) => { await weatherController.handleForecastWeatherRequest(req, res); });
  return weatherRouter;
}
```


## 10. Bootstrap & App Layers

### `bootstrap/envs/system.envs.ts` — `SystemConfig`

A class implementing `ISystemConfig`. Constructed once in `server.ts` from
the `systemConfig` slice returned by `injectSecretsFromInfisical()`. After
construction its three properties (`environment`, `port`, `logLevel`) are
`readonly`, making it a stable, immutable system config snapshot.

### `bootstrap/envs/module.envs.ts` — `ModuleConfig`

A class implementing `IModuleConfig`. Constructed once in `server.ts` from
the `moduleConfig` slice returned by `injectSecretsFromInfisical()`. After
construction all nine API URL/key properties are `readonly`.

### `bootstrap/bootstrap.types.ts`

Defines the three shared gateway types: `SharedDependencies`,
`GatewayControllers`, and `ModuleControllersProvider`. See [Section 12](#12-type-system).

### `bootstrap/providers/infisical.provider.ts`

Single export: `injectSecretsFromInfisical()` orchestrates Infisical
authentication (universal auth via `InfisicalSDK`), secret injection
(`listSecrets` with `attachToProcessEnv: true`), maps resolved `process.env`
values into `systemConfig` and `moduleConfig` literals, validates them with
`validateInfisicalSecrets()`, and returns `{ systemConfig, moduleConfig }`.

### `bootstrap/bootstrap.utils.ts`

Several utilities used across the bootstrap lifecycle:

| Export | Purpose |
|---|---|
| `bootGatewayControllers(deps)` | Wraps `registerGatewayControllers(deps)` in error handling; re-throws after logging on failure |
| `getEnvVar(key, fallback?)` | Reads a string from `process.env`; throws if absent and no fallback |
| `getEnvNumber(key, fallback?)` | Like `getEnvVar` but parses as `number` |
| `validateEnvs(secrets)` | Throws if any value in a record is falsy |
| `validateInfisicalCredentials(id, secret)` | Throws if either Infisical credential is missing |
| `validateInfisicalSecrets(secrets)` | Like `validateEnvs` but also logs the count of injected secrets |
| `validateGatewayControllers(logger, controllers)` | Iterates the controller map; throws if any entry is falsy |

### `app/http/clients/axios.client.ts` — `AxiosHttpClient`

Implements `IHttpClient`. Accepts `apiUrl`, `apiKey`, and `apiKeyName` at
construction time.

- `makeApiRequest(endpoint?, params?, additionalUris?)` — builds the full URL
  by joining `apiUrl`, `endpoint`, and any `additionalUris` segments; appends
  the API key as a query param using `apiKeyName`.
- `handleApiErrors(error)` — normalises Axios errors into readable `Error`
  messages, redacting the API key in logged params via `safetyCheckParams()`.

### `http/response.handler.ts` — `ControllerResponseHandler`

Implements `IResponseHandler`. Constructed once in `server.ts` with the
environment string, and injected into every controller via
`deps.responseHandler`. Core method is `handleRequest()` which handles the
full request lifecycle:

1. If `requiredParams` is provided, parses query params via `parseParams()`.
2. Validates required params via `validateParams()`; throws `BadRequestError` if any are missing.
3. Calls the provided `fetchFunction` (delegated to the service).
4. Validates the response via `validateResponse()`; throws `NotFoundError` if absent.
5. Sends `200` with the result wrapped under `responseKey`.
6. Catches `BadRequestError` → `400`, `NotFoundError` → `404`, anything else → `500`.

Also exposes: `successResponse`, `badRequest`, `notFound`, `badGatewayError`,
`internalServerError`.

Error details (`context`) in responses are suppressed when `environment === "prod"`.

### `http/api.errors.ts`

Typed `Error` subclasses used as discriminated signals within the request
lifecycle:

| Class | HTTP status | Thrown by |
|---|---|---|
| `BadRequestError` | 400 | `validateParams()` |
| `NotFoundError` | 404 | `validateResponse()` |

### `http/request.utils.ts`

| Function | Purpose |
|---|---|
| `parseParams(req, attrs)` | Extracts named keys from `req.query` into a plain record |
| `validateParams(params)` | Throws `BadRequestError` listing missing params if any are falsy |
| `validateResponse(data)` | Throws `NotFoundError` if `data` is `null` / `undefined` |

### `logger/winston.logger.ts` — `WinstonLogger`

Implements `ILogger`. Accepts an `ILoggerConfig` (satisfied by `SystemConfig`).
- Console transport is always active (colourised, simple format).
- File transports (`logs/error.log`, `logs/combined.log`) are added only
  when `config.environment === "prod"`.
- All transports use timestamp, error-stack, and JSON formatting.

### `logger/logger.utils.ts`

Named log helpers that accept an `ILogger` instance as their first argument:

| Function | Prefix | Level |
|---|---|---|
| `logProcess(logger, step)` | `[PROCESS]` | `info` |
| `logProcessError(logger, step, error)` | `[PROCESS]` | `error` |
| `logBootstrapStep(logger, step)` | `[BOOTSTRAP]` | `info` |
| `logBootstrapError(logger, step, error)` | `[BOOTSTRAP]` | `error` |
| `logInboundRaw(logger, message)` | `[INBOUND]` | `info` |
| `createMorganStream(logger)` | — | Pipes Morgan output to `logInboundRaw` |

Also exports `consoleLogger` — a lightweight `ILogger` backed by the native
`console` object, used for pre-bootstrap logging (before `WinstonLogger` exists).


## 11. Interface Layer

All cross-cutting contracts live in `app/interfaces/`. The directory is
split into two sub-folders:

### `interfaces/config/` — Configuration contracts

`index.interface.ts` composes the two top-level config types from smaller,
per-concern interfaces:

```typescript
// System-level: port, secrets, log settings
export type ISystemConfig = IServerConfig & ILoggerConfig;

// Module-level: API URLs and keys for each feature module
export type IModuleConfig = IWeatherConfig & INewsConfig & ICurrencyConfig
                          & IHolidayConfig & ISportsConfig & IAviationConfig & IAgroConfig;
```

Each sub-interface (`IServerConfig`, `ILoggerConfig`, `IWeatherConfig`, etc.)
lives in its own file within `interfaces/config/` and declares only the
fields relevant to that concern.

### `interfaces/infrastructure/`  Infrastructure contracts

#### `ILogger` (`logger.interface.ts`)

Logging contract. Implemented by `WinstonLogger`; `consoleLogger` is a
lightweight inline implementation used before the logger is constructed.

```typescript
export interface ILogger {
  info(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
}
```

#### `IHttpClient` (`http.interface.ts`)

HTTP client contract. Implemented by `AxiosHttpClient`.

```typescript
export interface IHttpClient {
  makeApiRequest<T = unknown>(
    endpoint?: string,
    params?: Record<string, unknown>,
    additionalUris?: string[],
  ): Promise<{ data: T; status?: number }>;
  handleApiErrors(error: unknown): never;
}
```

#### `IResponseHandler` (`response.handler.interface.ts`)

Response utility contract. Implemented by `ControllerResponseHandler`.

```typescript
export interface IResponseHandler {
  handleRequest(req, res, fetchFunction, responseKey, requiredParams?): Promise<void>;
  successResponse(res, message?, details?): void;
  badRequest(res, message?, details?): void;
  notFound(res, message?, details?): void;
  badGatewayError(res, message?, details?): void;
  internalServerError(res, message?, details?): void;
}
```


## 12. Type System

All shared gateway types live in `bootstrap/bootstrap.types.ts`.

### `SharedDependencies`

The bundle of shared infrastructure passed through the entire bootstrap chain.
Note the split between `systemConfig` and `moduleConfig`:

```typescript
export type SharedDependencies = {
  systemConfig:    ISystemConfig;
  moduleConfig:    IModuleConfig;
  logger:          ILogger;
  responseHandler: IResponseHandler;
  prismaClient:    PrismaClient;
};
```

### `ModuleControllersProvider`

A discriminated union keyed on the `name` literal. Each provider function
returns one specific member via `Extract<>`, so TypeScript narrows to the
concrete controller type for that module. Note that providers only expose
the **controller** (not the service) — services are internal to the provider:

```typescript
export type ModuleControllersProvider =
  | { name: "weather";  controller: WeatherController  }
  | { name: "news";     controller: NewsController     }
  | { name: "currency"; controller: CurrencyController }
  | { name: "holiday";  controller: HolidayController  }
  | { name: "sports";   controller: SportsController   }
  | { name: "aviation"; controller: AviationController }
  | { name: "argo";     controller: AgroController     };
```

### `GatewayControllers`

The typed controller map, keyed by camelCase names. Used by
`registerGatewayControllers()`, `bootGatewayControllers()`, and
`useGatewayRouters()` — keeping it the single source of truth:

```typescript
export type GatewayControllers = {
  weatherController:  WeatherController;
  newsController:     NewsController;
  currencyController: CurrencyController;
  holidayController:  HolidayController;
  sportsController:   SportsController;
  aviationController: AviationController;
  argoController:     AgroController;
};
```

> **Difference from earlier design**: There is no `GatewayServices` type.
> Services are created inside provider functions and are not tracked in the
> registry. Only controllers are validated and passed to the router layer.


## 13. Available Routes

All routes are mounted under `/v1`.

### Weather `/v1/weather`

| Method | Path | Required query params | Description |
|---|---|---|---|
| `GET` | `/current` | `lat`, `lon` | Current weather for a location |
| `GET` | `/forecast` | `lat`, `lon` | Multi-day forecast for a location |

### News `/v1/news`

| Method | Path | Description |
|---|---|---|
| `GET` | `/topic` | Search news articles by topic |
| `GET` | `/top-headlines` | Top headlines |

### Currency `/v1/currency`

| Method | Path | Required query params | Description |
|---|---|---|---|
| `GET` | `/live` | `symbols` | Live exchange rates |
| `GET` | `/historical` | `date` | Historical exchange rates |
| `GET` | `/convert` | `from`, `to`, `amount` | Currency conversion |
| `GET` | `/timeframe` | `start_date`, `end_date` | Rates over a date range |
| `GET` | `/change` | `start_date`, `end_date` | Rate fluctuation data |
| `GET` | `/list` | — | All supported currencies |

### Holidays `/v1/holiday`

| Method | Path | Required query params | Description |
|---|---|---|---|
| `GET` | `/PublicHolidays` | `year`, `countryCode` | Public holidays for a year + country |
| `GET` | `/NextPublicHolidays` | `countryCode` | Upcoming public holidays for a country |
| `GET` | `/NextPublicHolidaysWorldwide` | — | Upcoming public holidays globally |
| `GET` | `/AvailableCountries` | — | Countries supported by the API |
| `GET` | `/CountryInfo` | `countryCode` | Metadata for a country |
| `GET` | `/LongWeekend` | `year`, `countryCode` | Long weekends for a year + country |
| `GET` | `/IsTodayPublicHoliday` | `countryCode` | Whether today is a public holiday |

### Sports `/v1/sports`

| Method | Path | Required query params | Description |
|---|---|---|---|
| `GET` | `/searchTeams` | `t` | Search for teams by name |
| `GET` | `/searchEvents` | `e`, `s` | Search for events |
| `GET` | `/searchPlayers` | `p` | Search for players |
| `GET` | `/searchVenues` | `v` | Search for venues |
| `GET` | `/lookUpLeague` | `id` | Look up a league by ID |
| `GET` | `/lookUpTable` | `l` | Look up a league table by season/league ID |


## 14. Adding a New Module

Follow these steps to add a new domain (e.g. `maps`). There are exactly
ten touchpoints, in this order:

**1. Create the module folder:**
```
src/modules/maps/
    maps.types.ts
    maps.service.ts
    maps.controller.ts
    maps.routes.ts
    maps.provider.ts
```

**2. Add a per-concern config interface** in `app/interfaces/config/modules/`:
```typescript
// maps.index.interface.ts
export interface IMapsConfig {
  mapsApiUrl: string;
  mapsApiKey: string;
}
```

**3. Extend `IModuleConfig`** in `app/interfaces/config/index.interface.ts`:
```typescript
import { IMapsConfig } from "./modules/maps.index.interface.js";

export type IModuleConfig = IWeatherConfig & INewsConfig & ICurrencyConfig
                          & IHolidayConfig & ISportsConfig & IMapsConfig;
```

**4. Expose the new vars in `ModuleConfig`** (`bootstrap/envs/module.envs.ts`):
```typescript
public readonly mapsApiUrl: string;
public readonly mapsApiKey: string;

constructor(config: IModuleConfig) {
  // ...existing...
  this.mapsApiUrl = config.mapsApiUrl;
  this.mapsApiKey = config.mapsApiKey;
}
```

**5. Map the new vars in `infisical.provider.ts`:**
```typescript
const moduleConfig = {
  // ...existing...
  mapsApiUrl: getEnvVar("MAPS_API_URL", ""),
  mapsApiKey: getEnvVar("MAPS_API_KEY", ""),
} as const;
```

**6. Implement the service** — accept `IHttpClient`:
```typescript
export class MapsService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }
  async geocode(params: Record<string, string>) {
    try {
      const response = await this.httpClient.makeApiRequest("geocode/json", params);
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
```

**7. Implement the controller** — inject service and `IResponseHandler`:
```typescript
export class MapsController {
  private readonly httpClient: MapsService;
  private readonly responseHandler: IResponseHandler;
  constructor(mapsService: MapsService, responseHandler: IResponseHandler) {
    this.httpClient      = mapsService;
    this.responseHandler = responseHandler;
  }
  async handleGeocodeRequest(req: Request, res: Response) {
    await this.responseHandler.handleRequest(
      req, res,
      (params) => this.httpClient.geocode(params),
      "geocode",
      ["address"],
    );
  }
}
```

**8. Implement the router** — export a factory function (prefix with `provide`):
```typescript
export function provideMapsRouter(mapsController: MapsController): Router {
  const router = Router();
  router.get("/geocode", async (req, res) => {
    await mapsController.handleGeocodeRequest(req, res);
  });
  return router;
}
```

**9. Implement the provider** — construct `AxiosHttpClient` → service → controller:
```typescript
export function provideMapsController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "maps" }> {
  const mapsHttpClient = new AxiosHttpClient(
    deps.moduleConfig.mapsApiUrl,
    deps.moduleConfig.mapsApiKey,
    "key",
  );
  const mapsService    = new MapsService(mapsHttpClient);
  const mapsController = new MapsController(mapsService, deps.responseHandler);
  return { name: "maps", controller: mapsController };
}
```

**10. Update `bootstrap.types.ts`** — add the new variant and controller key:
```typescript
// ModuleControllersProvider — new union member:
| { name: "maps"; controller: MapsController }

// GatewayControllers — new key:
mapsController: MapsController;
```

**11. Register in `controllers.registry.ts`:**
```typescript
const maps = provideMapsController(deps);

const gatewayControllerRegistry: GatewayControllers = {
  ...existing,
  mapsController: maps.controller,
};
```

**12. Mount in `routes.registry.ts`:**
```typescript
import { provideMapsRouter } from "./maps/maps.routes.js";
apiRouter.use("/maps", provideMapsRouter(controllers.mapsController));
```

**13. Add the env vars to Infisical** — set `MAPS_API_URL` and `MAPS_API_KEY`
in the Infisical project for each target environment.


## 15. Environment Variables

### Local `.env` (bootstrap only)

Only these five values belong in `.env`. Everything else lives in Infisical.

| Variable | Purpose |
|---|---|
| `INFISICAL_SITE_URL` | Infisical instance URL |
| `INFISICAL_CLIENT_ID` | Universal auth client ID |
| `INFISICAL_CLIENT_SECRET` | Universal auth client secret |
| `INFISICAL_ENVIRONMENT` | Target environment (`dev`, `staging`, `prod`) |
| `INFISICAL_PROJECT_ID` | Infisical project to fetch secrets from |

### Infisical secrets (runtime)

Fetched at startup, injected into `process.env`, then mapped into two typed
objects (`systemConfig` → `SystemConfig`, `moduleConfig` → `ModuleConfig`).

**System config** (`ISystemConfig` / `SystemConfig`):

| Infisical variable | Config key | Purpose |
|---|---|---|
| `PORT` | `port` | Server listen port (default: `3000`) |
| `ENVIRONMENT` | `environment` | App environment label (default: `"dev"`) |
| `LOG_LEVEL` | `logLevel` | Winston log level (default: `"info"`) |

**Module config** (`IModuleConfig` / `ModuleConfig`):

| Infisical variable | Config key | Purpose |
|---|---|---|
| `WEATHER_API_URL` | `weatherApiUrl` | OpenWeatherMap base URL |
| `WEATHER_API_KEY` | `weatherApiKey` | OpenWeatherMap API key (`appid` query param) |
| `NEWS_API_URL` | `newsApiUrl` | NewsAPI base URL |
| `NEWS_API_KEY` | `newsApiKey` | NewsAPI key |
| `CURRENCY_API_URL` | `currencyApiUrl` | Currencylayer base URL |
| `CURRENCY_API_KEY` | `currencyApiKey` | Currencylayer key (`access_key` query param) |
| `HOLIDAY_API_URL` | `holidayApiUrl` | Nager.Date base URL (no key required) |
| `SPORTS_API_URL` | `sportsApiUrl` | TheSportsDB base URL |
| `SPORTS_API_KEY` | `sportsApiKey` | TheSportsDB API key (embedded in path segment) |
| `AVIATION_API_URL` | `aviationApiUrl` | Aviationstack base URL |
| `AVIATION_API_KEY` | `aviationApiKey` | Aviationstack API key |
| `AGRO_API_URL` | `agroApiUrl` | Agromonitoringstack base URL |
| `AGRO_API_KEY` | `agroApiKey` | Agromonitoringstack API key |
| `AGRO_POLYGON_ID` | `agroPolygonId` | Agromonitoringstack polygon ID |
