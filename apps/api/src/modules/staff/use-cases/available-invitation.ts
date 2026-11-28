import { InvalidInvitation } from "../domain/staff";
import type { InvitationClaimTransaction } from "../repositories/invitation-access-unit";

export async function availableInvitation(
  transaction: InvitationClaimTransaction,
) {
  const invitation = await transaction.pending();
  if (!invitation || !(await transaction.issuerIsAuthorized(invitation)))
    throw new InvalidInvitation();
  return invitation;
}
