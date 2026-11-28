import {
  InvitedIdentityAlreadyExists,
  type InvitedIdentityInput,
} from "../domain/invited-identity";
import type { InvitedIdentityRepository } from "../repositories/invited-identity.repository";

export class ProvisionInvitedIdentity {
  constructor(private readonly identities: InvitedIdentityRepository) {}
  async execute(input: InvitedIdentityInput) {
    const email = input.email.toLowerCase();
    if (await this.identities.exists(email))
      throw new InvitedIdentityAlreadyExists();
    return this.identities.create({ ...input, email, name: input.name.trim() });
  }
}
