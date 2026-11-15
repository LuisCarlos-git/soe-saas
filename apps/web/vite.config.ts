import { randomUUID } from "node:crypto";
import { waitForApi } from "./dev/wait-for-api.ts";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwind(),
    tanstackStart(),
    react(),
    {
      name: "soe-api-readiness",
      apply: "serve",
      async configureServer() {
        console.info("[SOE] Aguardando API e PostgreSQL ficarem prontos…");
        await waitForApi();
        console.info("[SOE] API pronta. Iniciando o web.");
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    port: 43120,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:43121",
        configure(proxy) {
          proxy.on("error", (_error, _request, response) => {
            if (!("writeHead" in response) || response.headersSent) return;
            const correlationId = randomUUID();
            response.writeHead(503, {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "x-correlation-id": correlationId,
            });
            response.end(
              JSON.stringify({
                code: "UNAVAILABLE",
                message:
                  "A API está iniciando ou reiniciando. Aguarde um instante e tente novamente.",
                correlationId,
              }),
            );
          });
        },
      },
    },
  },
});
