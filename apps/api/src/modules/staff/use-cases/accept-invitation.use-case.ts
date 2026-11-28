import {
  InvalidInvitation,
  InvitationMfaRequired,
  InvitationWrongIdentity,
  StaffConflict,
  type InvitationActor,
} from "../domain/staff";
import type { InvitationAccessUnit } from "../repositories/invitation-access-unit";
import { availableInvitation } from "./available-invitation";
export class AcceptInvitation {
  constructor(private readonly unit: InvitationAccessUnit) {}
  execute(hash: string, actor: InvitationActor) {
    return this.unit.transaction(hash, async (tx) => {
      const invitation = await availableInvitation(tx);
      if (invitation.email !== actor.email.toLowerCase())
        throw new InvitationWrongIdentity();
      if (invitation.roles.includes("SCHOOL_ADMIN") && !actor.mfaVerified)
        throw new InvitationMfaRequired();
      if (await tx.membershipExists(invitation, actor.id))
        throw new StaffConflict();
      if (!(await tx.consume(invitation, actor.id)))
        throw new InvalidInvitation();
      await tx.createMembership(invitation, actor.id);
      await tx.audit(invitation, actor.id, "STAFF_INVITATION_ACCEPTED");
    });
  }
}
