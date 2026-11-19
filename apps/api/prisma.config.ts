import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Match the API's root .env without overwriting explicit test/release environment values.
const environment = new URL("../../.env", import.meta.url);
if (existsSync(environment)) process.loadEnvFile(environment);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://soe:soe_local_only@127.0.0.1:54329/soe_dev",
  },
});
