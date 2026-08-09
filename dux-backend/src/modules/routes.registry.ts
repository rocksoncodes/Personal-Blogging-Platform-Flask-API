import { Router } from "express";
import { provideWeatherRouter } from "./weather/weather.routes.js";
import { provideNewsRouter } from "./news/news.routes.js";
import { provideCurrencyRouter } from "./currency/currency.routes.js";
import { provideHolidayRouter } from "./holidays/holiday.routes.js";
import { provideSportsRouter } from "./sports/sports.routes.js";
import { GatewayControllers } from "../bootstrap/bootstrap.types.js";
import { provideAviationRouter } from "./aviation/aviation.routes.js";
import { provideAgroRouter } from "./agriculture/agro.routes.js";
import { provideAuthRouter } from "./auth/auth.routes.js";
import { GatewayMiddleware } from "../app/middleware/middleware.service.js";

export function useGatewayRouters(
  controllers: GatewayControllers,
  middleware: GatewayMiddleware,
): Router {
  const apiRouter = Router();

  apiRouter.use(middleware.rateLimitRequest);
  apiRouter.use("/auth", provideAuthRouter(controllers.authController));

  apiRouter.use(middleware.authenticateRequest);

  apiRouter.use(
    "/weather",
    provideWeatherRouter(controllers.weatherController),
  );
  apiRouter.use("/news", provideNewsRouter(controllers.newsController));
  apiRouter.use(
    "/currency",
    provideCurrencyRouter(controllers.currencyController),
  );
  apiRouter.use(
    "/holiday",
    provideHolidayRouter(controllers.holidayController),
  );
  apiRouter.use("/sports", provideSportsRouter(controllers.sportsController));
  apiRouter.use(
    "/aviation",
    provideAviationRouter(controllers.aviationController),
  );
  apiRouter.use("/argo", provideAgroRouter(controllers.argoController));

  return apiRouter;
}
