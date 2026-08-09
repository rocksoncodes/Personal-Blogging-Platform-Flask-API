import { HolidayController } from "./holiday.controller.js";
import { Request, Response, Router } from "express";

export function provideHolidayRouter(
  holidayController: HolidayController,
): Router {
  const holidayRouter = Router();

  holidayRouter.get(
    "/PublicHolidays",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handlePublicHolidaysRequest(req, res);
    },
  );

  holidayRouter.get(
    "/NextPublicHolidays",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleNextPublicHolidaysRequest(req, res);
    },
  );

  holidayRouter.get(
    "/NextPublicHolidaysWorldwide",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleNextPublicHolidaysWorldwideRequest(
        req,
        res,
      );
    },
  );

  holidayRouter.get(
    "/AvailableCountries",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleAvailableCountriesRequest(req, res);
    },
  );

  holidayRouter.get(
    "/CountryInfo",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleCountryInfoRequest(req, res);
    },
  );

  holidayRouter.get(
    "/LongWeekend",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleLongWeekendRequest(req, res);
    },
  );

  holidayRouter.get(
    "/IsTodayPublicHoliday",
    async (req: Request, res: Response): Promise<void> => {
      await holidayController.handleIsTodayPublicHolidayRequest(req, res);
    },
  );

  return holidayRouter;
}
