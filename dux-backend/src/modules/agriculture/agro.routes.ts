import { Request, Response, Router } from "express";
import { AgroController } from "./agro.controller.js";

export function provideAgroRouter(agroController: AgroController): Router {
  const agroRouter = Router();

  agroRouter.post("/polygons", async (req: Request, res: Response) => {
    await agroController.handlePostPolygonsRequest(req, res);
  });

  agroRouter.get("/polygons", async (req: Request, res: Response) => {
    await agroController.handleGetPolygonsRequest(req, res);
  });

  agroRouter.get("/polygons/specific", async (req: Request, res: Response) => {
    await agroController.handleGetSpecificPolygonsRequest(req, res);
  });

  agroRouter.delete("/polygons/delete", async (req: Request, res: Response) => {
    await agroController.handleDeletePolygonsRequest(req, res);
  });

  agroRouter.delete(
    "/polygons/history",
    async (req: Request, res: Response) => {
      await agroController.handlePolygonCurrentHistoryRequest(req, res);
    },
  );

  agroRouter.get("/polygons/weather", async (req: Request, res: Response) => {
    await agroController.handlePolygonWeatherRequest(req, res);
  });

  agroRouter.get(
    "/polygons/weather/history",
    async (req: Request, res: Response) => {
      await agroController.handlePolygonWeatherHistoryRequest(req, res);
    },
  );

  agroRouter.get(
    "/polygons/uvi/history",
    async (req: Request, res: Response) => {
      await agroController.handlePolygonUviHistoryRequest(req, res);
    },
  );

  agroRouter.get(
    "/polygons/uvi/forecast",
    async (req: Request, res: Response) => {
      await agroController.handlePolygonUviForecastRequest(req, res);
    },
  );

  agroRouter.get(
    "/polygons/accumulated-temperature",
    async (req: Request, res: Response) => {
      await agroController.handleAccumulatedTemperatureRequest(req, res);
    },
  );

  agroRouter.get(
    "/polygons/accumulated-precipitation",
    async (req: Request, res: Response) => {
      await agroController.handleAccumulatedPrecipitationRequest(req, res);
    },
  );

  agroRouter.get(
    "/polygons/nvdi/history",
    async (req: Request, res: Response) => {
      await agroController.handleNdviHistoryRequest(req, res);
    },
  );

  return agroRouter;
}
