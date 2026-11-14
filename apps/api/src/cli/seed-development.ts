import { provisionDevelopmentIdentities } from "./synthetic-identities";
await provisionDevelopmentIdentities(
  process.env.DATABASE_URL ?? "",
  process.env.NODE_ENV ?? "",
);
console.log(
  "Contas sintéticas locais preparadas. Limite de tentativas reiniciado.",
);
