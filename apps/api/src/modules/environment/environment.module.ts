import { Module } from "@nestjs/common";
import { DATABASE } from "../../infrastructure/database/database.module";
import { createEnvironmentUseCases } from "./factories/environment.factory";
import { EnvironmentController } from "./controllers/environment.controller";
import { ReadEnvironment } from "./use-cases/read-environment.use-case";
import { CheckReadiness } from "./use-cases/check-readiness.use-case";
const USE_CASES = Symbol("ENVIRONMENT_USE_CASES");
@Module({
  providers: [
    {
      provide: USE_CASES,
      inject: [DATABASE],
      useFactory: createEnvironmentUseCases,
    },
    {
      provide: ReadEnvironment,
      inject: [USE_CASES],
      useFactory: (cases: ReturnType<typeof createEnvironmentUseCases>) =>
        cases.read,
    },
    {
      provide: CheckReadiness,
      inject: [USE_CASES],
      useFactory: (cases: ReturnType<typeof createEnvironmentUseCases>) =>
        cases.readiness,
    },
  ],
  controllers: [EnvironmentController],
  exports: [CheckReadiness],
})
export class EnvironmentModule {}
