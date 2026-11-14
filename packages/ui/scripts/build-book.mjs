import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const here = (path) => new URL(path, import.meta.url);
const kernel = await readFile(here("../vendor/hairline/kernel.js"), "utf8");
const figure = await readFile(
  here("../src/illustrations/book/book.js"),
  "utf8",
);
const license = await readFile(here("../vendor/hairline/LICENSE"), "utf8");
const adapter = await readFile(here("./book-adapter.js"), "utf8");
const hash = createHash("sha256").update(kernel).digest("hex");
if (hash !== "47ebec7647174e04e4f59c0305277c2a1dab83a763676946b17fa1694e7952fe")
  throw new Error(
    "Hairline kernel changed; review the upstream source before updating.",
  );
await mkdir(here("../dist/illustrations/book/"), { recursive: true });
// The skill's kernel and figure remain byte-for-byte intact; the adapter only owns lifecycle.
await writeFile(
  here("../dist/illustrations/book/book-runtime.js"),
  `/*!\n${license}*/\n${kernel}\nlet specification;\nfunction hairline(value) { specification = value; }\n${figure}\n${adapter}`,
);
