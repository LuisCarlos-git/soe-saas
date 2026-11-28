import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { startTestPostgres } from "../apps/api/tests/support/postgres.mjs";
import { startTestMailpit } from "../apps/api/tests/support/mailpit.mjs";
import { migrateTestDatabase } from "./migrate-test-database.mjs";

const webPort = "43220";
const apiPort = "43221";
const database = await startTestPostgres();
let mailbox;
try {
  mailbox = await startTestMailpit();
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/mailpit.json",
    JSON.stringify({ baseUrl: mailbox.baseUrl }),
  );
  migrateTestDatabase(database.url);
  const { provisionTestIdentities } =
    await import("../apps/api/dist/cli/synthetic-identities.js");
  await provisionTestIdentities(database.url, "test");
} catch (error) {
  await database.stop();
  await mailbox?.stop();
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
    API_PORT: apiPort,
    AUTH_ORIGIN: `http://127.0.0.1:${webPort}`,
    INVITATION_MAIL_MODE: "development-smtp",
    INVITATION_SMTP_HOST: mailbox.host,
    INVITATION_SMTP_PORT: String(mailbox.smtpPort),
    INVITATION_RATE_MAX: "500",
  },
});
const web = spawn(process.execPath, ["server.mjs"], {
  cwd: "apps/web",
  env: { ...process.env, SOE_WEB_PORT: webPort, SOE_API_PORT: apiPort },
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
  await mailbox.stop();
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
