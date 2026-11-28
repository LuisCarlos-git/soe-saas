import { StaffConflict } from "../domain/staff";
import { availableInvitation } from "./available-invitation";
import type {
  InvitationAccessUnit,
  PasswordEncoder,
} from "../repositories/invitation-access-unit";
export class RegisterInvitedIdentity {
  constructor(
    private readonly unit: InvitationAccessUnit,
    private readonly encoder: PasswordEncoder,
  ) {}
  async execute(hash: string, name: string, password: string) {
    await this.unit.transaction(hash, async (tx) => {
      const invitation = await availableInvitation(tx);
      if (await tx.identityExists(invitation.email)) throw new StaffConflict();
    });
    const encoded = await this.encoder.encode(password);
    await this.unit.transaction(hash, async (tx) => {
      const invitation = await availableInvitation(tx);
      if (await tx.identityExists(invitation.email)) throw new StaffConflict();
      const userId = await tx.createIdentity(invitation.email, name, encoded);
      await tx.audit(invitation, userId, "INVITED_IDENTITY_CREATED");
    });
  }
}
