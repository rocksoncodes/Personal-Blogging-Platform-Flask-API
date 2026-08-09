import { Request, Response } from "express";
import { AuthService } from "../../app/interfaces/modules/auth.module.interface.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";

export class AuthKeyController {
  private readonly authService: AuthService;
  private readonly responseHandler: IResponseHandler;

  constructor(authService: AuthService, responseHandler: IResponseHandler) {
    this.authService = authService;
    this.responseHandler = responseHandler;
  }

  async handleApiKeyRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      () => this.authService.createApiKey(),
      "ApiKeyResponse",
    );
  }
}
