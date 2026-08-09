import { Request, Response, Router } from "express";
import { CurrencyController } from "./currency.controller.js";

export function provideCurrencyRouter(
  currencyController: CurrencyController,
): Router {
  const currencyRouter = Router();

  currencyRouter.get(
    "/live",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleLiveRateRequest(req, res);
    },
  );

  currencyRouter.get(
    "/historical",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleHistoricalRateRequest(req, res);
    },
  );

  currencyRouter.get(
    "/convert",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleConversionRateRequest(req, res);
    },
  );

  currencyRouter.get(
    "/timeframe",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleTimeFrameRequest(req, res);
    },
  );

  currencyRouter.get(
    "/change",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleChangeRateRequest(req, res);
    },
  );

  currencyRouter.get(
    "/list",
    async (req: Request, res: Response): Promise<void> => {
      await currencyController.handleAllCurrenciesRequest(req, res);
    },
  );

  return currencyRouter;
}
