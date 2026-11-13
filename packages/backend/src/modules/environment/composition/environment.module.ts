import { Module, type DynamicModule } from "@nestjs/common";
import { createDatabase } from "@soe/database";
import { ReadEnvironment } from "../application/read-environment.js";
import { PrismaEnvironmentProbe } from "../infrastructure/prisma-probe.js";

export const ENVIRONMENT_PROBE = Symbol("ENVIRONMENT_PROBE");

@Module({})
export class EnvironmentModule {
  static forRoot(url: string): DynamicModule {
    const database = createDatabase(url);
    return {
      module: EnvironmentModule,
      providers: [
        {
          provide: ENVIRONMENT_PROBE,
          useFactory: () => new PrismaEnvironmentProbe(database),
        },
        {
          provide: ReadEnvironment,
          useFactory: (probe: PrismaEnvironmentProbe) =>
            new ReadEnvironment(probe),
          inject: [ENVIRONMENT_PROBE],
        },
        {
          provide: "DATABASE_SHUTDOWN",
          useValue: { onModuleDestroy: () => database.$disconnect() },
        },
      ],
      exports: [ENVIRONMENT_PROBE, ReadEnvironment],
    };
  }
}
