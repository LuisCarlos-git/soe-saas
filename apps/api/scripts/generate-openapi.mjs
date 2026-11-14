import { writeFile } from "node:fs/promises";
import { createApi, createOpenApi } from "../dist/app.js";

const app = await createApi({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://synthetic:unused@127.0.0.1:1/unused",
  LOG_LEVEL: "silent",
});
try {
  await app.init();
  const document = createOpenApi(app);
  await writeFile(
    new URL("../dist/openapi.json", import.meta.url),
    JSON.stringify(document, null, 2) + "\n",
  );
} finally {
  await app.close();
}
