import { serve } from "srvx";
import { staticMiddleware } from "srvx/static";
import { fileURLToPath } from "node:url";
import start from "./dist/server/server.js";

serve({
  hostname: "127.0.0.1",
  port: Number(process.env.SOE_WEB_PORT ?? 43120),
  gracefulShutdown: true,
  middleware: [
    staticMiddleware({
      dir: fileURLToPath(new URL("./dist/client", import.meta.url)),
    }),
  ],
  async fetch(request) {
    const url = new URL(request.url);
    if (
      url.pathname.startsWith("/api/v1/") ||
      url.pathname.startsWith("/api/auth/")
    ) {
      const upstream = new URL(
        `http://127.0.0.1:${Number(process.env.SOE_API_PORT ?? 43121)}`,
      );
      upstream.pathname = url.pathname;
      upstream.search = url.search;
      const headers = new Headers({ Accept: "application/json" });
      for (const name of [
        "cookie",
        "origin",
        "content-type",
        "sec-fetch-site",
      ]) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
      }
      return fetch(upstream, {
        method: request.method,
        headers,
        ...(request.method !== "GET" && request.method !== "HEAD"
          ? { body: request.body, duplex: "half" }
          : {}),
        redirect: "manual",
        signal: request.signal,
      });
    }
    const response = await start.fetch(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  },
});
