import { spawn } from "node:child_process";
import { startTestPostgres } from "@soe/test-utils";
import { migrateTestDatabase } from "./migrate-test-database.mjs";

const database = await startTestPostgres();
try {
  migrateTestDatabase(database.url);
  const { provisionTestIdentities } = await import("@soe/backend");
  await provisionTestIdentities(database.url, "test");
} catch (error) {
  await database.stop();
  throw error;
}
const api = spawn(process.execPath, ["apps/api/dist/main.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: database.url,
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    AUTH_RATE_MAX: "100",
    API_HOST: "127.0.0.1",
    API_PORT: "43121",
  },
});
const web = spawn(process.execPath, ["server.mjs"], {
  cwd: "apps/web",
  stdio: "inherit",
});
let stopping = false;
async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 10_000);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill("SIGTERM");
  });
}
async function stop() {
  if (stopping) return;
  stopping = true;
  await Promise.all([stopChild(api), stopChild(web)]);
  await database.stop();
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
api.once("exit", (code) => {
  if (!stopping) {
    console.error(`API exited: ${code}`);
    void stop();
  }
});
web.once("exit", (code) => {
  if (!stopping) {
    console.error(`Web exited: ${code}`);
    void stop();
  }
});
