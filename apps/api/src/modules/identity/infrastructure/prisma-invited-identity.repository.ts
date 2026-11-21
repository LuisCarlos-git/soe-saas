import { randomUUID } from "node:crypto";
import type { Prisma } from "../../../infrastructure/database/generated/client";
import type { InvitedIdentityInput } from "../domain/invited-identity";
import type { InvitedIdentityRepository } from "../repositories/invited-identity.repository";

export class PrismaInvitedIdentityRepository implements InvitedIdentityRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}
  async exists(email: string) {
    return !!(await this.tx.user.findUnique({
      where: { email },
      select: { id: true },
    }));
  }
  async create(input: InvitedIdentityInput) {
    const id = randomUUID();
    await this.tx.user.create({
      data: {
        id,
        email: input.email,
        name: input.name,
        emailVerified: true,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: id,
            password: input.encodedPassword,
          },
        },
      },
    });
    await this.tx.authenticationAudit.create({
      data: { userId: id, action: "INVITED_IDENTITY_CREATED" },
    });
    return id;
  }
}
