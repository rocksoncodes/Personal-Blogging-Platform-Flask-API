export interface IHttpClient {
  makeApiRequest<T = unknown>(
    endpoint?: string,
    params?: any,
    additionalUris?: string[],
  ): Promise<{ data: T; status?: number }>;

  handleApiErrors(error: unknown): never;
}
