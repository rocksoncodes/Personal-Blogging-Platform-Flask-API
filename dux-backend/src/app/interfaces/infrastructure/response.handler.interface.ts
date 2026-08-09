import { Request, Response } from "express";

export interface IResponseHandler {
  handleRequest(
    req: Request,
    res: Response,
    fetchFunction: (params?: any) => Promise<any> | unknown,
    responseKey: string,
    requiredParams?: string[],
  ): Promise<void>;

  successResponse(res: Response, message?: string, details?: unknown): void;
  badRequest(res: Response, message?: string, details?: unknown): void;
  notFound(res: Response, message?: string, details?: unknown): void;
  badGatewayError(res: Response, message?: string, details?: unknown): void;
  internalServerError(res: Response, message?: string, details?: unknown): void;
}
