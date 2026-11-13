import { spawn } from "node:child_process";
import { startTestPostgres } from "@soe/test-utils";

const database = await startTestPostgres();
const api = spawn(process.execPath, ["apps/api/dist/main.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: database.url,
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    API_HOST: "127.0.0.1",
    API_PORT: "43121",
  },
});
const web = spawn(process.execPath, ["server.mjs"], {
  cwd: "apps/web",
  stdio: "inherit",
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  api.kill("SIGTERM");
  web.kill("SIGTERM");
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
