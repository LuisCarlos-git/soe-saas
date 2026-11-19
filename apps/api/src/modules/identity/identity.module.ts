import { Module, type DynamicModule } from "@nestjs/common";
import type { parseConfiguration } from "../../shared/config";
import { DATABASE } from "../../infrastructure/database/database.module";
import type { Database } from "../../infrastructure/database/database.factory";
import { createAuthentication } from "./factories/authentication.factory";
import { CurrentIdentity } from "./use-cases/current-identity.use-case";
import { IdentityController } from "./controllers/identity.controller";
import { AUTHENTICATION } from "./authentication.token";
export { AUTHENTICATION } from "./authentication.token";
@Module({})
export class IdentityModule {
  static forRoot(config: ReturnType<typeof parseConfiguration>): DynamicModule {
    return {
      module: IdentityModule,
      providers: [
        {
          provide: AUTHENTICATION,
          inject: [DATABASE],
          useFactory: (database: Database) =>
            createAuthentication(config, database),
        },
        {
          provide: CurrentIdentity,
          inject: [AUTHENTICATION],
          useFactory: (auth: ReturnType<typeof createAuthentication>) =>
            auth.current,
        },
      ],
      controllers: [IdentityController],
      exports: [AUTHENTICATION],
    };
  }
}
