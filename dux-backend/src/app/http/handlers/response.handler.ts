import { Request, Response } from "express";

import { IResponseHandler } from "../../interfaces/infrastructure/response.handler.interface.js";
import {
  BadRequestError,
  NotFoundError,
  parseParams,
  validateParams,
  validateResponse,
} from "../request.utils.js";

export class ControllerResponseHandler implements IResponseHandler {
  constructor(private readonly environment: string) {}

  /**
   * Configurable method for handling incoming HTTP Requests
   * and returning a response.
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param fetchFunction - Function that executes the request
   * @param responseKey - Data label for the returned data
   * @param requiredParams - Required parameters need for the endpoint
   * */
  public async handleRequest(
    req: Request,
    res: Response,
    fetchFunction: (params?: any) => Promise<any>,
    responseKey: string,
    requiredParams?: string[],
  ): Promise<void> {
    try {
      let requestParams;

      if (requiredParams?.length) {
        requestParams = parseParams(req, requiredParams);
        validateParams(requestParams);
      }

      const serviceResponse = await fetchFunction(requestParams);

      validateResponse(serviceResponse);

      this.successResponse(res, "Data fetched successfully", {
        [responseKey]: serviceResponse,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        this.badRequest(res, error.message);
      } else if (error instanceof NotFoundError) {
        this.notFound(res, error.message);
      } else {
        this.internalServerError(res, "Failed to process request", error);
      }
    }
  }

  /**
   * Send a 200 success response.
   *
   * @param res - Express response object.
   * @param message - Optional success message.
   * @param details - Optional additional response details.
   */
  successResponse(
    res: Response,
    message = "Success!",
    details?: unknown,
  ): void {
    this.send(res, 200, message, details);
  }

  /**
   * Send a 400 bad request response.
   *
   * @param res - Express response object.
   * @param message - Optional bad request message.
   * @param details - Optional additional response details.
   */
  badRequest(res: Response, message = "Bad Request", details?: unknown): void {
    this.send(res, 400, message, this.getErrorDetails(details));
  }

  /**
   * Send a 404 not found response.
   *
   * @param res - Express response object.
   * @param message - Optional not found message.
   * @param details - Optional additional response details.
   */
  notFound(res: Response, message = "Not Found", details?: unknown): void {
    this.send(res, 404, message, this.getErrorDetails(details));
  }

  /**
   * Send a 502 bad gateway response for upstream fetch failures.
   *
   * @param res - Express response object.
   * @param message - Optional failure message.
   * @param details - Optional additional response details.
   */
  badGatewayError(
    res: Response,
    message = "Failed to fetch upstream data",
    details?: unknown,
  ): void {
    this.send(res, 502, message, this.getErrorDetails(details));
  }

  /**
   * Send a 500 internal server error response.
   *
   * @param res - Express response object.
   * @param message - Optional error message.
   * @param details - Optional additional response details.
   */
  internalServerError(
    res: Response,
    message = "Internal Server Error",
    details?: unknown,
  ): void {
    this.send(res, 500, message, this.getErrorDetails(details));
  }

  /**
   * Send a JSON response with a given HTTP status code.
   *
   * @param res - Express response object.
   * @param statusCode - HTTP status code to send.
   * @param message - Primary error or success message.
   * @param details - Optional additional response details.
   */
  private send(
    res: Response,
    statusCode: number,
    message: string,
    details?: unknown,
  ): void {
    res.status(statusCode).json({
      message: message,
      ...(details ? { details: details } : {}),
    });
  }

  /**
   * Parses error instances for extra context.
   * Suppressed entirely in production.
   *
   * @param error - Request error object.
   */
  private getErrorDetails(error: unknown):
    | {
        context: string;
      }
    | undefined {
    if (this.environment === "prod") {
      return undefined;
    }

    if (error instanceof Error) {
      return { context: error.message };
    }
    return { context: String(error) };
  }
}
