import { AuthRepo } from "../../app/interfaces/modules/auth.module.interface.js";
import { PrismaClient } from "../../generated/prisma/client.js";

export class AuthRepository implements AuthRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async getApiKey(keyId: string): Promise<string | null> {
    const key = await this.prisma.apiKey.findUnique({
      where: { keyId },
    });
    return key ? key.hashedKey : null;
  }

  async storeHashedApiKey(
    keyId: string,
    hashedKey: string,
    createdAt: string,
  ): Promise<void> {
    await this.prisma.apiKey.create({
      data: {
        keyId,
        hashedKey,
        createdAt: new Date(createdAt),
      },
    });
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await this.prisma.apiKey.delete({
      where: { keyId },
    });
  }
}
