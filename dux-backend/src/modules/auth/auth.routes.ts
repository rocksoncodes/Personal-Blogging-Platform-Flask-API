import { Request, Response, Router } from "express";
import { AuthKeyController } from "./auth.controller.js";

export function provideAuthRouter(
  authKeyController: AuthKeyController,
): Router {
  const authRouter = Router();

  authRouter.get("/gateway-key", async (req: Request, res: Response) => {
    await authKeyController.handleApiKeyRequest(req, res);
  });

  return authRouter;
}
