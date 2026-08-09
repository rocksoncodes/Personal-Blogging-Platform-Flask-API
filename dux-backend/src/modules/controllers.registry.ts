import {
  GatewayControllers,
  SharedDependencies,
} from "../bootstrap/bootstrap.types.js";
import { validateGatewayControllers } from "../bootstrap/bootstrap.utils.js";
import { provideWeatherController } from "./weather/weather.provider.js";
import { provideNewsController } from "./news/news.provider.js";
import { provideCurrencyController } from "./currency/currency.provider.js";
import { provideHolidayController } from "./holidays/holiday.provider.js";
import { provideSportsController } from "./sports/sports.provider.js";
import { provideAviationController } from "./aviation/aviation.provider.js";
import { provideArgoController } from "./agriculture/argo.provider.js";
import { provideAuthController } from "./auth/auth.provider.js";

export function registerGatewayControllers(
  deps: SharedDependencies,
): GatewayControllers {
  const weather = provideWeatherController(deps);
  const news = provideNewsController(deps);
  const currency = provideCurrencyController(deps);
  const holiday = provideHolidayController(deps);
  const sports = provideSportsController(deps);
  const aviation = provideAviationController(deps);
  const argo = provideArgoController(deps);
  const auth = provideAuthController(deps);

  const gatewayControllerRegistry: GatewayControllers = {
    weatherController: weather.controller,
    newsController: news.controller,
    currencyController: currency.controller,
    holidayController: holiday.controller,
    sportsController: sports.controller,
    aviationController: aviation.controller,
    argoController: argo.controller,
    authController: auth.controller,
  };

  validateGatewayControllers(deps.logger, gatewayControllerRegistry);

  return gatewayControllerRegistry;
}
