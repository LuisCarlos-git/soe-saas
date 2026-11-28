import type { InvitationAccessUnit } from "../repositories/invitation-access-unit";
export class ReadOwnMemberships {
  constructor(private readonly unit: InvitationAccessUnit) {}
  async execute(userId: string) {
    return { memberships: await this.unit.memberships(userId) };
  }
}
