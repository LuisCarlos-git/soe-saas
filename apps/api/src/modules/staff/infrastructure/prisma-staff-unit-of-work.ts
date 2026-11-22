import { randomUUID } from "node:crypto";
import type { Database } from "../../../infrastructure/database/database.factory";
import type {
  StaffUnitOfWork,
  StaffTransaction,
} from "../repositories/staff-unit-of-work";
import { isStaffRole, StaffConflict, type Invitation } from "../domain/staff";
import type { InvitationMail } from "./invitation-mail";
import type { Prisma } from "../../../infrastructure/database/generated/client";

type InvitationRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  deliveryStatus: string;
  createdAt: Date;
  expiresAt: Date;
  sentAt: Date | null;
  acceptedAt: Date | null;
  revokedAt: Date | null;
};
export function invitationProjection(row: InvitationRow): Invitation {
  const roles = row.roles.filter(isStaffRole);
  if (
    roles.length !== row.roles.length ||
    !["QUEUED", "SENT", "FAILED"].includes(row.deliveryStatus)
  )
    throw new Error("Invalid invitation state");
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roles,
    status: row.acceptedAt
      ? "ACCEPTED"
      : row.expiresAt <= new Date()
        ? "EXPIRED"
        : row.revokedAt
          ? "REVOKED"
          : "PENDING",
    deliveryStatus:
      row.deliveryStatus === "SENT"
        ? "SENT"
        : row.deliveryStatus === "FAILED"
          ? "FAILED"
          : "QUEUED",
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    sentAt: row.sentAt?.toISOString() ?? null,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
  };
}
export class PrismaStaffUnitOfWork implements StaffUnitOfWork {
  constructor(
    private readonly db: Database,
    private readonly mail: InvitationMail,
    private readonly lifetimeSeconds: number,
  ) {}
  async transaction<T>(
    organizationId: string,
    actorId: string,
    work: (tx: StaffTransaction) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.db.$transaction(
        async (tx) =>
          work({
            isAdministrator: async () =>
              !!(await tx.schoolMembership.findFirst({
                where: {
                  organizationId,
                  userId: actorId,
                  active: true,
                  roles: { has: "SCHOOL_ADMIN" },
                },
              })),
            hasMember: async (email) =>
              !!(await tx.schoolMembership.findFirst({
                where: { organizationId, user: { email } },
              })),
            hasPendingInvitation: async (email) =>
              !!(await tx.schoolInvitation.findFirst({
                where: {
                  organizationId,
                  email,
                  acceptedAt: null,
                  revokedAt: null,
                  expiresAt: { gt: new Date() },
                },
              })),
            supersedeExpiredInvitations: async (email) => {
              const where = {
                organizationId,
                email,
                acceptedAt: null,
                revokedAt: null,
                expiresAt: { lte: new Date() },
              };
              const rows = await tx.schoolInvitation.findMany({ where });
              await tx.schoolInvitation.updateMany({
                where,
                data: {
                  revokedAt: new Date(),
                  tokenCiphertext: null,
                  revision: { increment: 1 },
                },
              });
              return rows.map(invitationProjection);
            },
            listInvitations: async (query) => {
              const now = new Date();
              const search = query.search.replace(/[\\%_]/g, "\\$&");
              const statusWhere: Prisma.SchoolInvitationWhereInput =
                query.status === "ACCEPTED"
                  ? { acceptedAt: { not: null } }
                  : query.status === "PENDING"
                    ? {
                        acceptedAt: null,
                        revokedAt: null,
                        expiresAt: { gt: now },
                      }
                    : query.status === "EXPIRED"
                      ? { acceptedAt: null, expiresAt: { lte: now } }
                      : query.status === "REVOKED"
                        ? {
                            acceptedAt: null,
                            revokedAt: { not: null },
                            expiresAt: { gt: now },
                          }
                        : {};
              const where: Prisma.SchoolInvitationWhereInput = {
                organizationId,
                ...statusWhere,
                ...(search && {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                }),
              };
              const total = await tx.schoolInvitation.count({ where });
              const rows = await tx.schoolInvitation.findMany({
                where,
                orderBy: [
                  { [query.sortBy]: query.sortDirection },
                  { id: "asc" },
                ],
                skip: query.offset,
                take: query.limit,
              });
              const userIds = rows.flatMap((row) =>
                row.acceptedByUserId ? [row.acceptedByUserId] : [],
              );
              const memberships = await tx.schoolMembership.findMany({
                where: { organizationId, userId: { in: userIds } },
                select: { userId: true, active: true },
              });
              const active = new Map(
                memberships.map((member) => [member.userId, member.active]),
              );
              return {
                invitations: rows.map((row) => ({
                  ...invitationProjection(row),
                  membershipActive: row.acceptedAt
                    ? (active.get(row.acceptedByUserId ?? "") ?? false)
                    : null,
                })),
                hasMore: query.offset + rows.length < total,
                total,
              };
            },
            createInvitation: async (input) => {
              const id = randomUUID();
              const secret = this.mail.secrets.mint(id, 1);
              const row = await tx.schoolInvitation.create({
                data: {
                  ...input,
                  id,
                  organizationId,
                  createdByUserId: actorId,
                  tokenHash: secret.hash,
                  tokenCiphertext: secret.encrypted,
                  expiresAt: new Date(Date.now() + this.lifetimeSeconds * 1000),
                },
              });
              await this.mail.enqueue(tx, {
                invitationId: id,
                organizationId,
                revision: 1,
              });
              return invitationProjection(row);
            },
            audit: async (action, invitation, replacementId) => {
              await tx.schoolAudit.create({
                data: {
                  organizationId,
                  actorId,
                  action,
                  details: {
                    invitationId: invitation.id,
                    email: invitation.email,
                    roles: invitation.roles,
                    ...(replacementId && { replacementId }),
                  },
                },
              });
            },
          }),
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        ["P2002", "P2034"].includes(String(error.code))
      )
        throw new StaffConflict();
      throw error;
    }
  }
}
