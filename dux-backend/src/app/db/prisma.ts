import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { defaultLogger, logProcess } from "../logger/logger.utils.js";

export function providePrismaClient(databaseUrl: string): PrismaClient {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  logProcess(defaultLogger, "Prisma Client initialized.");
  return new PrismaClient({ adapter });
}
