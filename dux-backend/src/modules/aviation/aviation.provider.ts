import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";
import { AviationService } from "./aviation.service.js";
import { AviationController } from "./aviation.controller.js";

export function provideAviationController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "aviation" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.aviationApiUrl,
    deps.moduleEnvs.aviationApiKey,
    "access_key",
  );

  const aviationService = new AviationService(currentHttpClient);
  const aviationController = new AviationController(
    aviationService,
    deps.responseHandler,
  );

  return {
    name: "aviation",
    controller: aviationController,
  };
}
