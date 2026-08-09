export type AuthService = {
  createApiKey(): Promise<ApiKeyResponse>;
};

export type AuthRepo = {
  storeHashedApiKey(
    keyId: string,
    hashedKey: string,
    createdAt: string,
  ): Promise<void>;
  getApiKey(keyId: string): Promise<string | null>;
  deleteApiKey(keyId: string): Promise<void>;
};

export interface ApiKeyResponse {
  apiKey: string;
  createdAt: string;
}
