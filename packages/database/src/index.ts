import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";

export function createDatabase(url: string, timeoutMs = 1500) {
  const adapter = new PrismaPg({
    connectionString: url,
    max: 4,
    connectionTimeoutMillis: timeoutMs,
    query_timeout: timeoutMs,
    statement_timeout: timeoutMs,
  });
  return new PrismaClient({ adapter, log: [] });
}
export type Database = ReturnType<typeof createDatabase>;
