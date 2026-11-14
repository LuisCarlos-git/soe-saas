import { createDatabase } from "@soe/database";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

// No arbitrary credentials and no production mode: only disposable synthetic fixtures.
export async function provisionTestIdentities(
  url: string,
  environment: string,
) {
  if (environment !== "test" || new URL(url).pathname !== "/soe_test")
    throw new Error("Synthetic identities require an isolated test database");
  const database = createDatabase(url);
  try {
    for (const [name, email] of [
      ["Ana Teste", "ana@example.test"],
      ["Bia Teste", "bia@example.test"],
    ]) {
      if (!name || !email) continue;
      const id = randomUUID();
      await database.user.create({
        data: {
          id,
          name,
          email,
          accounts: {
            create: {
              id: randomUUID(),
              providerId: "credential",
              accountId: id,
              password: await hashPassword("Synthetic-only-123!"),
            },
          },
        },
      });
    }
  } finally {
    await database.$disconnect();
  }
}
