import { PrismaClient } from "../../generated/prisma/client.js";
import crypto from "node:crypto";

export type MiddlewareRepo = {
  checkClientApiKey(apiKey: string): Promise<boolean>;
};

export class MiddlewareRepository implements MiddlewareRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async checkClientApiKey(apiKey: string): Promise<boolean> {
    if (typeof apiKey !== "string" || !apiKey.startsWith("gw_")) return false;

    const secret = apiKey.slice(3);
    const hashedKey = crypto.createHash("sha256").update(secret).digest("hex");

    const key = await this.prisma.apiKey.findFirst({
      where: { hashedKey },
    });
    return !!key;
  }
}
