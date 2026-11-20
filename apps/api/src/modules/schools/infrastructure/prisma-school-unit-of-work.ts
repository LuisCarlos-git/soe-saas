import type { Database } from "../../../infrastructure/database/database.factory";
import type {
  SchoolUnitOfWork,
  SchoolTransaction,
} from "../repositories/school-unit-of-work";
import {
  SchoolConflict,
  SchoolForbidden,
  type School,
  type SchoolSettings,
} from "../domain/school";

const select = {
  id: true,
  name: true,
  timeZone: true,
  academicYear: true,
  supportTeamLabel: true,
  studentLabel: true,
  classLabel: true,
  version: true,
  initialAdministrator: { select: { name: true, email: true } },
} as const;
const membership = (actorId: string) => ({
  memberships: {
    some: { userId: actorId, active: true, role: "SCHOOL_ADMIN" },
  },
});
function project(row: Omit<School, "pilotStatus">): School {
  return { ...row, pilotStatus: "SYNTHETIC_ONLY" };
}

export class PrismaSchoolUnitOfWork implements SchoolUnitOfWork {
  constructor(private readonly database: Database) {}
  async transaction<T>(
    work: (transaction: SchoolTransaction) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.database.$transaction(
        async (tx) =>
          work({
            isOperator: async (actorId) =>
              !!(await tx.saasOperator.findFirst({
                where: { userId: actorId, enabled: true },
              })),
            findAdministrator: (email) =>
              tx.user.findUnique({ where: { email }, select: { id: true } }),
            create: async (settings, administratorId) =>
              project(
                await tx.organization.create({
                  data: {
                    ...settings,
                    initialAdministratorId: administratorId,
                    memberships: {
                      create: { userId: administratorId, role: "SCHOOL_ADMIN" },
                    },
                  },
                  select,
                }),
              ),
            findForAdministrator: async (organizationId, actorId) => {
              const row = await tx.organization.findFirst({
                where: { id: organizationId, ...membership(actorId) },
                select,
              });
              return row ? project(row) : null;
            },
            updateForAdministrator: async (
              organizationId,
              actorId,
              settings: SchoolSettings,
              version,
            ) => {
              const result = await tx.organization.updateMany({
                where: { id: organizationId, version, ...membership(actorId) },
                data: { ...settings, version: { increment: 1 } },
              });
              if (!result.count) return null;
              const row = await tx.organization.findFirst({
                where: { id: organizationId, ...membership(actorId) },
                select,
              });
              return row ? project(row) : null;
            },
            audit: async (organizationId, actorId, action, details) => {
              await tx.schoolAudit.create({
                data: {
                  organizationId,
                  actorId,
                  action,
                  details: { ...details },
                },
              });
            },
          }),
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2034")
        throw new SchoolConflict();
      throw error;
    }
  }
  async access(actorId: string) {
    const [operator, memberships] = await this.database.$transaction([
      this.database.saasOperator.findFirst({
        where: { userId: actorId, enabled: true },
      }),
      this.database.schoolMembership.findMany({
        where: { userId: actorId, active: true, role: "SCHOOL_ADMIN" },
        select: { organization: { select: { id: true, name: true } } },
        orderBy: { organization: { name: "asc" } },
      }),
    ]);
    return {
      canProvisionSchools: !!operator,
      schools: memberships.map((row) => row.organization),
    };
  }
  async listForOperator(actorId: string, offset: number) {
    return this.database.$transaction(
      async (tx) => {
        if (
          !(await tx.saasOperator.findFirst({
            where: { userId: actorId, enabled: true },
          }))
        )
          throw new SchoolForbidden();
        const rows = await tx.organization.findMany({
          select,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          skip: offset,
          take: 21,
        });
        return {
          schools: rows.slice(0, 20).map(project),
          hasMore: rows.length > 20,
        };
      },
      { isolationLevel: "Serializable" },
    );
  }
}
