import { createDatabase } from "../infrastructure/database/database.factory";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

// Fixed synthetic identities only; both entrypoints reject production databases.
export async function provisionTestIdentities(
  url: string,
  environment: string,
) {
  if (environment !== "test" || new URL(url).pathname !== "/soe_test")
    throw new Error("Synthetic identities require an isolated test database");
  await provision(url, true);
}

export async function provisionDevelopmentIdentities(
  url: string,
  environment: string,
) {
  const target = new URL(url);
  if (
    environment !== "development" ||
    target.hostname !== "127.0.0.1" ||
    target.port !== "54329" ||
    target.pathname !== "/soe_dev" ||
    target.username !== "soe"
  )
    throw new Error(
      "Synthetic identities require the local development database",
    );
  await provision(url);
  const database = createDatabase(url);
  try {
    await database.rateLimit.deleteMany();
  } finally {
    await database.$disconnect();
  }
}

async function provision(url: string, mfaFixtures = false) {
  const database = createDatabase(url);
  try {
    for (const [name, email] of [
      ["Ana Teste", "ana@example.test"],
      ["Bia Teste", "bia@example.test"],
      ["Operador Teste", "operator@example.test"],
      ...(mfaFixtures
        ? [
            ["MFA Ana", "mfa-ana@example.test"],
            ["MFA Bia", "mfa-bia@example.test"],
            ["Operador Desktop", "operator-desktop@example.test"],
            ["Operador Mobile", "operator-mobile@example.test"],
            ["Responsável Desktop", "school-desktop@example.test"],
            ["Responsável Mobile", "school-mobile@example.test"],
          ]
        : []),
    ]) {
      if (!name || !email) continue;
      const password = await hashPassword("12345678");
      await database.$transaction(async (transaction) => {
        const user = await transaction.user.upsert({
          where: { email },
          update: {},
          create: { id: randomUUID(), name, email },
        });
        if (
          [
            "operator@example.test",
            "operator-desktop@example.test",
            "operator-mobile@example.test",
          ].includes(email)
        )
          await transaction.saasOperator.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
          });
        const account = await transaction.account.findFirst({
          where: { userId: user.id, providerId: "credential" },
        });
        if (account)
          await transaction.account.update({
            where: { id: account.id },
            data: { password },
          });
        else
          await transaction.account.create({
            data: {
              id: randomUUID(),
              providerId: "credential",
              accountId: user.id,
              userId: user.id,
              password,
            },
          });
      });
    }
  } finally {
    await database.$disconnect();
  }
}
