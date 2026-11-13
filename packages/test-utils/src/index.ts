import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export async function startTestPostgres() {
  const container = await new PostgreSqlContainer("postgres:17.9-alpine")
    .withDatabase("soe_test")
    .withUsername("soe_test")
    .withPassword("synthetic_test_only")
    .start();
  const url = container.getConnectionUri();
  try {
    execFileSync("pnpm", ["--filter", "@soe/database", "db:migrate:deploy"], {
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      env: { ...process.env, DATABASE_URL: url, NODE_ENV: "test" },
      stdio: "pipe",
    });
    return {
      url,
      stop: async (): Promise<void> => {
        await container.stop();
      },
      pause: (): void => {
        execFileSync("docker", ["pause", container.getId()]);
      },
      unpause: (): void => {
        execFileSync("docker", ["unpause", container.getId()]);
      },
    };
  } catch (error) {
    await container.stop();
    throw error;
  }
}
