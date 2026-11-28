import { availableInvitation } from "./available-invitation";
import type { InvitationAccessUnit } from "../repositories/invitation-access-unit";
export class PreviewInvitation {
  constructor(private readonly unit: InvitationAccessUnit) {}
  async execute(hash: string) {
    return this.unit.transaction(hash, async (tx) => {
      const invitation = await availableInvitation(tx);
      return {
        name: invitation.name,
        email: invitation.email,
        roles: invitation.roles,
        expiresAt: invitation.expiresAt,
        schoolName: invitation.schoolName,
        timeZone: invitation.timeZone,
        registrationRequired: !(await tx.identityExists(invitation.email)),
      };
    });
  }
}
