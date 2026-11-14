import { build } from "esbuild";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Nest/tsc emits decorator metadata first; esbuild resolves extensionless imports in that JS.
export async function bundleApi() {
  await rm(new URL("../dist/", import.meta.url), {
    recursive: true,
    force: true,
  });
  await build({
    absWorkingDir: fileURLToPath(new URL("../", import.meta.url)),
    entryPoints: {
      app: ".build/app.js",
      main: ".build/main.js",
      "cli/synthetic-identities": ".build/cli/synthetic-identities.js",
      "cli/seed-development": ".build/cli/seed-development.js",
    },
    bundle: true,
    platform: "node",
    target: "node24",
    format: "esm",
    packages: "external",
    outdir: "dist",
    sourcemap: true,
    keepNames: true,
    logLevel: "info",
  });
}
await bundleApi();
