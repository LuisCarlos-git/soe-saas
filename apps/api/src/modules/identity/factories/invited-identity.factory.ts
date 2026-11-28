import { hashPassword } from "better-auth/crypto";
import type { Prisma } from "../../../infrastructure/database/generated/client";
import { PrismaInvitedIdentityRepository } from "../infrastructure/prisma-invited-identity.repository";
import { ProvisionInvitedIdentity } from "../use-cases/provision-invited-identity.use-case";
import type { InvitedIdentityInput } from "../domain/invited-identity";

// Internal application capability: caller has verified the invitation before provisioning.
// The transaction is composed by factories so Identity and school audit commit together.
export function createInvitedIdentityAccess(
  transaction: Prisma.TransactionClient,
) {
  const repository = new PrismaInvitedIdentityRepository(transaction);
  const provision = new ProvisionInvitedIdentity(repository);
  return {
    exists: (email: string) => repository.exists(email),
    provision: (input: InvitedIdentityInput) => provision.execute(input),
  };
}
export const encodeInvitedIdentityPassword = hashPassword;
