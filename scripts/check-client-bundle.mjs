import { readdirSync, readFileSync } from "node:fs";
const folder = "apps/web/dist/client";
const forbidden =
  /@soe\/(?:backend|database)|PrismaClient|DATABASE_URL|soe_local_only|127\.0\.0\.1:43121|createServerApi|AUTH_SECRET|synthetic-development-secret|better-auth\/|@better-auth\//;
for (const file of readdirSync(folder, { recursive: true })) {
  if (
    typeof file === "string" &&
    /\.(js|html|map)$/.test(file) &&
    forbidden.test(readFileSync(`${folder}/${file}`, "utf8"))
  ) {
    throw new Error(`Server-only content in client bundle: ${file}`);
  }
}
console.log(
  "Client bundle contains no server-only package, credential or upstream address.",
);
