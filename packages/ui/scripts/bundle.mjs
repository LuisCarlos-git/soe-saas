import { readdir } from "node:fs/promises";
import { build } from "esbuild";
const root = new URL("../", import.meta.url);
const files = await readdir(new URL("src/", root), { recursive: true });
await build({
  absWorkingDir: root.pathname,
  entryPoints: files
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".d.ts"))
    .map((file) => `src/${file}`),
  outbase: "src",
  outdir: "dist",
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  packages: "external",
  external: ["@soe/ui/book-runtime"],
  target: "es2022",
  sourcemap: true,
  logLevel: "warning",
});
