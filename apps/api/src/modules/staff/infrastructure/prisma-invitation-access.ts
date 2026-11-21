import type { Prisma } from "../../../infrastructure/database/generated/client";
import type { Database } from "../../../infrastructure/database/database.factory";
import type {
  InvitationAccessUnit,
  InvitationClaimTransaction,
} from "../repositories/invitation-access-unit";
import {
  InvalidInvitation,
  StaffConflict,
  isStaffRole,
  type PendingInvitation,
} from "../domain/staff";

export class PrismaInvitationAccess implements InvitationAccessUnit {
  constructor(
    private readonly db: Database,
    private readonly identities: (transaction: Prisma.TransactionClient) => {
      exists(email: string): Promise<boolean>;
      provision(input: {
        email: string;
        name: string;
        encodedPassword: string;
      }): Promise<string>;
    },
  ) {}
  async transaction<T>(
    hash: string,
    work: (transaction: InvitationClaimTransaction) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.db.$transaction(
        async (tx) => {
          const pending = async (): Promise<PendingInvitation | null> => {
            const row = await tx.schoolInvitation.findFirst({
              where: {
                tokenHash: hash,
                acceptedAt: null,
                revokedAt: null,
                expiresAt: { gt: new Date() },
              },
              select: {
                id: true,
                organizationId: true,
                name: true,
                email: true,
                roles: true,
                expiresAt: true,
                createdByUserId: true,
                isInitial: true,
                organization: { select: { name: true, timeZone: true } },
              },
            });
            if (!row) return null;
            const roles = row.roles.filter(isStaffRole);
            if (roles.length !== row.roles.length)
              throw new InvalidInvitation();
            return {
              id: row.id,
              organizationId: row.organizationId,
              name: row.name,
              email: row.email,
              roles,
              createdByUserId: row.createdByUserId,
              isInitial: row.isInitial,
              expiresAt: row.expiresAt.toISOString(),
              schoolName: row.organization.name,
              timeZone: row.organization.timeZone,
            };
          };
          return work({
            pending,
            issuerIsAuthorized: async (invitation) =>
              invitation.isInitial
                ? !!(await tx.saasOperator.findFirst({
                    where: {
                      userId: invitation.createdByUserId,
                      enabled: true,
                    },
                  }))
                : !!(await tx.schoolMembership.findFirst({
                    where: {
                      organizationId: invitation.organizationId,
                      userId: invitation.createdByUserId,
                      active: true,
                      roles: { has: "SCHOOL_ADMIN" },
                    },
                  })),
            identityExists: (email) => this.identities(tx).exists(email),
            createIdentity: (email, name, encodedPassword) =>
              this.identities(tx).provision({ email, name, encodedPassword }),
            membershipExists: async (invitation, userId) =>
              !!(await tx.schoolMembership.findUnique({
                where: {
                  organizationId_userId: {
                    organizationId: invitation.organizationId,
                    userId,
                  },
                },
              })),
            createMembership: async (invitation, userId) => {
              await tx.schoolMembership.create({
                data: {
                  organizationId: invitation.organizationId,
                  userId,
                  roles: invitation.roles,
                  role: invitation.roles.includes("SCHOOL_ADMIN")
                    ? "SCHOOL_ADMIN"
                    : invitation.roles[0]!,
                },
              });
            },
            consume: async (invitation, userId) =>
              (
                await tx.schoolInvitation.updateMany({
                  where: {
                    organizationId: invitation.organizationId,
                    id: invitation.id,
                    tokenHash: hash,
                    acceptedAt: null,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                  },
                  data: {
                    acceptedAt: new Date(),
                    acceptedByUserId: userId,
                    tokenCiphertext: null,
                  },
                })
              ).count === 1,
            audit: async (invitation, actorId, action) => {
              await tx.schoolAudit.create({
                data: {
                  organizationId: invitation.organizationId,
                  actorId,
                  action,
                  details: {
                    invitationId: invitation.id,
                    roles: invitation.roles,
                    createdByUserId: invitation.createdByUserId,
                  },
                },
              });
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        if (error.code === "P2034") throw new InvalidInvitation();
        if (error.code === "P2002") throw new StaffConflict();
      }
      throw error;
    }
  }
  async memberships(userId: string) {
    const rows = await this.db.schoolMembership.findMany({
      where: { userId, active: true },
      select: {
        organizationId: true,
        roles: true,
        organization: { select: { name: true } },
      },
      orderBy: { organization: { name: "asc" } },
    });
    return rows.map((row) => {
      const roles = row.roles.filter(isStaffRole);
      if (roles.length !== row.roles.length)
        throw new Error("Invalid membership state");
      return {
        organizationId: row.organizationId,
        name: row.organization.name,
        roles,
      };
    });
  }
}
