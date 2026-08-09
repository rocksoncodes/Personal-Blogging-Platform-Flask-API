import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";
import { AgroService } from "./agro.service.js";
import { AgroController } from "./agro.controller.js";

export function provideArgoController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "argo" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.agroApiUrl,
    deps.moduleEnvs.agroApiKey,
    "appid",
  );

  const argoService = new AgroService(currentHttpClient);
  const argoController = new AgroController(argoService, deps.responseHandler);

  return {
    name: "argo",
    controller: argoController,
  };
}
