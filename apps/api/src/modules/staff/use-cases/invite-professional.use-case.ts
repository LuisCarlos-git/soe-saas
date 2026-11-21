import {
  StaffConflict,
  StaffNotFound,
  type InviteProfessionalInput,
} from "../domain/staff";
import type { StaffUnitOfWork } from "../repositories/staff-unit-of-work";
export class InviteProfessional {
  constructor(private readonly unit: StaffUnitOfWork) {}
  execute(
    actorId: string,
    organizationId: string,
    input: InviteProfessionalInput,
  ) {
    return this.unit.transaction(organizationId, actorId, async (tx) => {
      if (!(await tx.isAdministrator())) throw new StaffNotFound();
      if (
        (await tx.hasMember(input.email)) ||
        (await tx.hasPendingInvitation(input.email))
      )
        throw new StaffConflict();
      const expired = await tx.supersedeExpiredInvitations(input.email);
      const invitation = await tx.createInvitation(input);
      for (const previous of expired)
        await tx.audit("INVITATION_EXPIRED_REPLACED", previous, invitation.id);
      await tx.audit("INVITATION_CREATED", invitation);
      return invitation;
    });
  }
}
