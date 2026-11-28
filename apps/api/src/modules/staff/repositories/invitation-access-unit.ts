import type { PendingInvitation, StaffRole } from "../domain/staff";
export interface InvitationClaimTransaction {
  pending(): Promise<PendingInvitation | null>;
  issuerIsAuthorized(invitation: PendingInvitation): Promise<boolean>;
  identityExists(email: string): Promise<boolean>;
  createIdentity(
    email: string,
    name: string,
    encodedPassword: string,
  ): Promise<string>;
  membershipExists(
    invitation: PendingInvitation,
    userId: string,
  ): Promise<boolean>;
  createMembership(
    invitation: PendingInvitation,
    userId: string,
  ): Promise<void>;
  consume(invitation: PendingInvitation, userId: string): Promise<boolean>;
  audit(
    invitation: PendingInvitation,
    actorId: string,
    action: string,
  ): Promise<void>;
}
export interface InvitationAccessUnit {
  transaction<T>(
    hash: string,
    work: (transaction: InvitationClaimTransaction) => Promise<T>,
  ): Promise<T>;
  memberships(
    userId: string,
  ): Promise<{ organizationId: string; name: string; roles: StaffRole[] }[]>;
}
export interface PasswordEncoder {
  encode(value: string): Promise<string>;
}
