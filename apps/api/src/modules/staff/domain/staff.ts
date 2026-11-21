export const STAFF_ROLES = [
  "SCHOOL_ADMIN",
  "DIRECTION",
  "COORDINATION",
  "EDUCATIONAL_GUIDANCE",
  "TUTOR",
  "TEACHER",
  "MONITOR",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const isStaffRole = (role: string): role is StaffRole =>
  STAFF_ROLES.some((value) => value === role);
export type InviteProfessionalInput = {
  name: string;
  email: string;
  roles: StaffRole[];
};
export type Invitation = InviteProfessionalInput & {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  deliveryStatus: "QUEUED" | "SENT" | "FAILED";
  createdAt: string;
  expiresAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
};
export class StaffNotFound extends Error {}
export class StaffConflict extends Error {}
export class InvitationMailUnavailable extends Error {}
export class InvalidInvitation extends Error {}
export class InvitationMfaRequired extends Error {}
export class InvitationWrongIdentity extends Error {}
export type PendingInvitation = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  roles: StaffRole[];
  expiresAt: string;
  schoolName: string;
  timeZone: string;
  createdByUserId: string;
  isInitial: boolean;
};
export type InvitationActor = {
  id: string;
  email: string;
  mfaVerified: boolean;
};
