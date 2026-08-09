import { Request, Response, Router } from "express";
import { WeatherController } from "./weather.controller.js";

export function provideWeatherRouter(
  weatherController: WeatherController,
): Router {
  const weatherRouter = Router();

  weatherRouter.get(
    "/current",
    async (req: Request, res: Response): Promise<void> => {
      await weatherController.handleCurrentWeatherRequest(req, res);
    },
  );

  weatherRouter.get(
    "/forecast",
    async (req: Request, res: Response): Promise<void> => {
      await weatherController.handleForecastWeatherRequest(req, res);
    },
  );

  return weatherRouter;
}
