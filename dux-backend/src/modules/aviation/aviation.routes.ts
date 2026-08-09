import { Request, Response, Router } from "express";
import { AviationController } from "./aviation.controller.js";

export function provideAviationRouter(
  aviationController: AviationController,
): Router {
  const aviationRouter = Router();

  aviationRouter.get(
    "/flights",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetFlightsRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/pasts",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetPastFlightsRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/schedules",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetFlightScheduleRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/futures",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetFutureFlightsRequest(req, res);
    },
  );

  aviationRouter.get(
    "/airports",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetAirportsRequest(req, res);
    },
  );

  aviationRouter.get(
    "/airlines",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetAirlinesRequest(req, res);
    },
  );

  aviationRouter.get(
    "/aircraft/types",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleAirCraftTypesRequest(req, res);
    },
  );

  aviationRouter.get(
    "/aircraft/registration",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetAirCraftRegistrationRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/cities",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetCitiesRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/countries",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetCountriesRequest(req, res);
    },
  );

  aviationRouter.get(
    "/flights/taxes",
    async (req: Request, res: Response): Promise<void> => {
      await aviationController.handleGetTaxesRequest(req, res);
    },
  );

  return aviationRouter;
}
