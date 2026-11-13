import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execFileSync } from "node:child_process";

export async function startTestPostgres() {
  const container = await new PostgreSqlContainer("postgres:17.9-alpine")
    .withDatabase("soe_test")
    .withUsername("soe_test")
    .withPassword("synthetic_test_only")
    .start();
  const url = container.getConnectionUri();
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
}
