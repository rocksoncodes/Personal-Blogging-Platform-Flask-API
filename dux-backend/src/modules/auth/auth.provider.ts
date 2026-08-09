import { AuthKeyService } from "./auth.service.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthKeyController } from "./auth.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";

export function provideAuthController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "auth" }> {
  const authKeyRepo = new AuthRepository(deps.prismaClient);
  const authKeyService = new AuthKeyService(authKeyRepo);
  const authKeyController = new AuthKeyController(
    authKeyService,
    deps.responseHandler,
  );

  return {
    name: "auth",
    controller: authKeyController,
  };
}
