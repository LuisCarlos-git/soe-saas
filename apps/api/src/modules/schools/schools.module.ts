import { Module, type DynamicModule } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import type { parseConfiguration } from "../../shared/config";
import { DATABASE } from "../../infrastructure/database/database.module";
import type { Database } from "../../infrastructure/database/database.factory";
import { PrismaSchoolUnitOfWork } from "./infrastructure/prisma-school-unit-of-work";
import { FindSchoolAccess } from "./use-cases/find-school-access.use-case";
import { ListPilotSchools } from "./use-cases/list-pilot-schools.use-case";
import { ListManagedSchools } from "./use-cases/list-managed-schools.use-case";
import { ProvisionSchool } from "./use-cases/provision-school.use-case";
import { ReadSchoolSettings } from "./use-cases/read-school-settings.use-case";
import { UpdateSchoolSettings } from "./use-cases/update-school-settings.use-case";
import {
  SchoolsController,
  SCHOOL_ORIGIN,
} from "./controllers/schools.controller";
@Module({})
export class SchoolsModule {
  static forRoot(config: ReturnType<typeof parseConfiguration>): DynamicModule {
    return {
      module: SchoolsModule,
      imports: [IdentityModule.forRoot(config)],
      controllers: [SchoolsController],
      providers: [
        { provide: SCHOOL_ORIGIN, useValue: config.AUTH_ORIGIN },
        ...[
          FindSchoolAccess,
          ListPilotSchools,
          ListManagedSchools,
          ProvisionSchool,
          ReadSchoolSettings,
          UpdateSchoolSettings,
        ].map((useCase) => ({
          provide: useCase,
          inject: [DATABASE],
          useFactory: (db: Database) =>
            new useCase(new PrismaSchoolUnitOfWork(db)),
        })),
      ],
    };
  }
}
