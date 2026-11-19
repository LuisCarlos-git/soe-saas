import { execFileSync } from "node:child_process";

process.loadEnvFile(new URL("../../../.env", import.meta.url));

// Keep dev and production on the same decorator-aware bundle pipeline.
execFileSync("pnpm", ["exec", "nest", "build"], { stdio: "inherit" });
await import("./bundle.mjs");
await import("../dist/main.js");
