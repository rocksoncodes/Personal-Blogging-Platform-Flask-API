import { defineConfig } from "prisma/config";
import { bootstrapSecrets } from "./src/bootstrap/providers/infisical.provider.js";
import { defaultLogger } from "./src/app/logger/logger.utils.js";

const { secrets } = await bootstrapSecrets(defaultLogger);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: secrets.systemEnvs.databaseUrl,
  },
});
