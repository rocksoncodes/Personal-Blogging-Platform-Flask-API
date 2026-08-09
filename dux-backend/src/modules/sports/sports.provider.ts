import { SportsService } from "./sports.service.js";
import { SportsController } from "./sports.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";

export function provideSportsController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "sports" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.sportsApiUrl,
    deps.moduleEnvs.sportsApiKey,
    "",
  );
  const sportsService = new SportsService(
    currentHttpClient,
    deps.moduleEnvs.sportsApiKey,
  );
  const sportsController = new SportsController(
    sportsService,
    deps.responseHandler,
  );

  return {
    name: "sports",
    controller: sportsController,
  };
}
