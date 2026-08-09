import crypto from "node:crypto";
import {
  ApiKeyResponse,
  AuthRepo,
  AuthService,
} from "../../app/interfaces/modules/auth.module.interface.js";

export class AuthKeyService implements AuthService {
  private readonly length: number;
  private readonly prefix: string;
  private readonly authKeyRepository: AuthRepo;

  constructor(authKeyRepository: AuthRepo) {
    this.length = 32;
    this.prefix = "gw_";
    this.authKeyRepository = authKeyRepository;
  }

  async createApiKey(): Promise<ApiKeyResponse> {
    const keyId = crypto.randomBytes(6).toString("hex");
    const secret = crypto.randomBytes(this.length).toString("base64url");
    const apiKey = `${this.prefix}${secret}`;

    const hashedKey = crypto.createHash("sha256").update(secret).digest("hex");
    const createdAt = new Date().toISOString();

    await this.authKeyRepository.storeHashedApiKey(keyId, hashedKey, createdAt);

    return { apiKey, createdAt };
  }
}
