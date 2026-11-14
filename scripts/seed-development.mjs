import { provisionDevelopmentIdentities } from "@soe/backend";
await provisionDevelopmentIdentities(
  process.env.DATABASE_URL ?? "",
  process.env.NODE_ENV ?? "",
);
console.log(
  "Contas sintéticas locais preparadas: ana@example.test e bia@example.test. Limite de tentativas reiniciado.",
);
