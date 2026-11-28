import { Module, type DynamicModule } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { encodeInvitedIdentityPassword } from "../identity/public";
import type { parseConfiguration } from "../../shared/config";
import { DATABASE } from "../../infrastructure/database/database.module";
import type { Database } from "../../infrastructure/database/database.factory";
import { IdentityModule } from "../identity/identity.module";
import { InvitationMail } from "./infrastructure/invitation-mail";
import { PrismaStaffUnitOfWork } from "./infrastructure/prisma-staff-unit-of-work";
import { InviteProfessional } from "./use-cases/invite-professional.use-case";
import { ListInvitations } from "./use-cases/list-invitations.use-case";
import {
  StaffInvitationsController,
  STAFF_ORIGIN,
} from "./controllers/staff-invitations.controller";
import {
  PublicInvitationsController,
  MembershipsController,
} from "./controllers/public-invitations.controller";
import { createInvitationAccess } from "./factories/invitation-access.factory";
import { PrismaInvitationRateLimit } from "./infrastructure/prisma-invitation-rate-limit";
import { PreviewInvitation } from "./use-cases/preview-invitation.use-case";
import { RegisterInvitedIdentity } from "./use-cases/register-invited-identity.use-case";
import { AcceptInvitation } from "./use-cases/accept-invitation.use-case";
import { ReadOwnMemberships } from "./use-cases/read-own-memberships.use-case";
@Module({})
export class StaffModule {
  static forRoot(config: ReturnType<typeof parseConfiguration>): DynamicModule {
    return {
      module: StaffModule,
      imports: [
        IdentityModule.forRoot(config),
        ThrottlerModule.forRootAsync({
          inject: [DATABASE],
          useFactory: (db: Database) => ({
            throttlers: [{ ttl: 60000, limit: config.INVITATION_RATE_MAX }],
            storage: new PrismaInvitationRateLimit(db, config.AUTH_SECRET),
          }),
        }),
      ],
      controllers: [
        StaffInvitationsController,
        PublicInvitationsController,
        MembershipsController,
      ],
      providers: [
        ThrottlerGuard,
        { provide: STAFF_ORIGIN, useValue: config.AUTH_ORIGIN },
        {
          provide: InvitationMail,
          inject: [DATABASE, Logger],
          useFactory: (db: Database, logger: Logger) =>
            new InvitationMail(db, config, () =>
              logger.error({ event: "invitation.queue.unavailable" }),
            ),
        },
        ...[InviteProfessional, ListInvitations].map((useCase) => ({
          provide: useCase,
          inject: [DATABASE, InvitationMail],
          useFactory: (db: Database, mail: InvitationMail) =>
            new useCase(
              new PrismaStaffUnitOfWork(
                db,
                mail,
                config.INVITATION_TTL_SECONDS,
              ),
            ),
        })),
        ...[PreviewInvitation, AcceptInvitation, ReadOwnMemberships].map(
          (useCase) => ({
            provide: useCase,
            inject: [DATABASE],
            useFactory: (db: Database) =>
              new useCase(createInvitationAccess(db)),
          }),
        ),
        {
          provide: RegisterInvitedIdentity,
          inject: [DATABASE],
          useFactory: (db: Database) =>
            new RegisterInvitedIdentity(createInvitationAccess(db), {
              encode: encodeInvitedIdentityPassword,
            }),
        },
      ],
      exports: [InvitationMail],
    };
  }
}
