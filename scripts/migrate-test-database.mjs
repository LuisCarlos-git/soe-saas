import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// The consuming test suite owns migrations, not the neutral container utility.
export function migrateTestDatabase(url) {
  const parsed = new URL(url);
  if (
    !/^postgres(ql)?:$/.test(parsed.protocol) ||
    parsed.pathname !== "/soe_test"
  ) {
    throw new Error(
      "Refusing to migrate a database outside the synthetic test fixture.",
    );
  }
  execFileSync("pnpm", ["--filter", "@soe/api", "db:migrate:deploy"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, DATABASE_URL: url, NODE_ENV: "test" },
    stdio: "pipe",
  });
}
