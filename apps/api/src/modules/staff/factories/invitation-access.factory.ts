import type { Database } from "../../../infrastructure/database/database.factory";
import {
  createInvitedIdentityAccess,
  InvitedIdentityAlreadyExists,
} from "../../identity/public";
import { StaffConflict } from "../domain/staff";
import { PrismaInvitationAccess } from "../infrastructure/prisma-invitation-access";

export function createInvitationAccess(db: Database) {
  return new PrismaInvitationAccess(db, (transaction) => {
    const identity = createInvitedIdentityAccess(transaction);
    return {
      exists: identity.exists,
      provision: async (input) => {
        try {
          return await identity.provision(input);
        } catch (error) {
          if (error instanceof InvitedIdentityAlreadyExists)
            throw new StaffConflict();
          throw error;
        }
      },
    };
  });
}
