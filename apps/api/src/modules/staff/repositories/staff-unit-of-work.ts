import type { Invitation, InviteProfessionalInput } from "../domain/staff";
export interface StaffTransaction {
  isAdministrator(): Promise<boolean>;
  hasMember(email: string): Promise<boolean>;
  hasPendingInvitation(email: string): Promise<boolean>;
  supersedeExpiredInvitations(email: string): Promise<Invitation[]>;
  createInvitation(input: InviteProfessionalInput): Promise<Invitation>;
  audit(
    action: string,
    invitation: Invitation,
    replacementId?: string,
  ): Promise<void>;
  listInvitations(
    offset: number,
  ): Promise<{ invitations: Invitation[]; hasMore: boolean }>;
}
export interface StaffUnitOfWork {
  transaction<T>(
    organizationId: string,
    actorId: string,
    work: (transaction: StaffTransaction) => Promise<T>,
  ): Promise<T>;
}
