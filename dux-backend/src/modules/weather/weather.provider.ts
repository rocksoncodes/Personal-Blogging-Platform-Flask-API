import { WeatherService } from "./weather.service.js";
import { WeatherController } from "./weather.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";

export function provideWeatherController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "weather" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.weatherApiUrl,
    deps.moduleEnvs.weatherApiKey,
    "appid",
  );
  const weatherService = new WeatherService(currentHttpClient);
  const weatherController = new WeatherController(
    weatherService,
    deps.responseHandler,
  );

  return {
    name: "weather",
    controller: weatherController,
  };
}
