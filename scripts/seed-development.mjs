import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.execPath,
  ["--env-file=.env", "apps/api/dist/cli/seed-development.js"],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
