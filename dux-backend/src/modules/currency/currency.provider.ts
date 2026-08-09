import { CurrencyService } from "./currency.service.js";
import { CurrencyController } from "./currency.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";

export function provideCurrencyController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "currency" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.currencyApiUrl,
    deps.moduleEnvs.currencyApiKey,
    "access_key",
  );
  const currencyService = new CurrencyService(currentHttpClient);
  const currencyController = new CurrencyController(
    currencyService,
    deps.responseHandler,
  );

  return {
    name: "currency",
    controller: currencyController,
  };
}
