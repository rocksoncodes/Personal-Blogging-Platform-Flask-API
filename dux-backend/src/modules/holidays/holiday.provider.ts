import { HolidayService } from "./holiday.service.js";
import { HolidayController } from "./holiday.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";

export function provideHolidayController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "holiday" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.holidayApiUrl,
    "",
    "",
  );
  const holidayService = new HolidayService(currentHttpClient);
  const holidayController = new HolidayController(
    holidayService,
    deps.responseHandler,
  );

  return {
    name: "holiday",
    controller: holidayController,
  };
}
