import { serve } from "srvx";
import { staticMiddleware } from "srvx/static";
import { fileURLToPath } from "node:url";
import start from "./dist/server/server.js";

serve({
  hostname: "127.0.0.1",
  port: 43120,
  gracefulShutdown: true,
  middleware: [
    staticMiddleware({
      dir: fileURLToPath(new URL("./dist/client", import.meta.url)),
    }),
  ],
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/v1/")) {
      const upstream = new URL("http://127.0.0.1:43121");
      upstream.pathname = url.pathname;
      upstream.search = url.search;
      return fetch(upstream, {
        method: request.method,
        headers: { Accept: "application/json" },
        signal: request.signal,
      });
    }
    const response = await start.fetch(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  },
});
