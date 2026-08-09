import axios from "axios";
import { IHttpClient } from "../../interfaces/infrastructure/http.interface.js";

export class AxiosHttpClient implements IHttpClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiKeyName: string;

  constructor(apiUrl: string, apiKey: string, apiKeyName: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.apiKeyName = apiKeyName;
  }

  /**
   * Fetches data from a public API endpoint.
   *
   * @param endpoint - API path segment, example: "weather" or "forecast".
   * @param params
   * @param additionalUris - Additional URI segments to append to the endpoint, example: "v2", "details".
   */
  public async makeApiRequest<T = unknown>(
    endpoint?: string,
    params?: any,
    additionalUris?: string[],
  ): Promise<{ data: T; status: number }> {
    let fullEndpoint = endpoint ?? "";

    if (additionalUris && additionalUris.length > 0) {
      for (const uri of additionalUris) {
        fullEndpoint += `/${uri}`;
      }
    }

    const response = await axios.get<T>(`${this.apiUrl}/${fullEndpoint}`, {
      params: {
        ...params,
        [this.apiKeyName]: this.apiKey,
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * Normalizes errors from Axios requests and throws a readable Error.
   *
   * @param error - The caught error from an API request.
   */
  public handleApiErrors(error: unknown): never {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const method = error.config?.method?.toUpperCase();
        const url = error.config?.url;
        const params = this.safetyCheckParams(
          error.config?.params as Record<string, unknown>,
        );

        throw new Error(
          [
            "External API request failed",
            `Method : ${method}`,
            `URL    : ${url}`,
            `Params : ${JSON.stringify(params, null, 2)}`,
            `Status : ${error.response.status}`,
            `Body   : ${JSON.stringify(error.response.data, null, 2)}`,
          ].join("\n"),
        );
      }

      if (error.request) {
        throw new Error(
          [
            "External API did not respond",
            `URL : ${error.config?.url}`,
            `Params : ${JSON.stringify(error.config?.params, null, 2)}`,
          ].join("\n"),
        );
      }
    }
    throw new Error(
      `Unexpected error during API request [${this.apiUrl}]: 
    ${(error as Error).message}`,
    );
  }

  private safetyCheckParams(
    params: Record<string, unknown> = {},
  ): Record<string, unknown> {
    /**
     * Replace or mark API key values for safe logging.
     * @param params - The request params to inspect.
     * @returns A copy of params with the API key redacted or marked.
     */
    const sanitized = { ...(params ?? {}) };

    if (!(this.apiKeyName in sanitized)) {
      sanitized[this.apiKeyName] = "[MISSING]";
      return sanitized;
    }

    sanitized[this.apiKeyName] =
      sanitized[this.apiKeyName] === this.apiKey ? "[REDACTED]" : "[INVALID]";

    return sanitized;
  }
}
