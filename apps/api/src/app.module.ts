import { Module, type DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import { LoggerModule } from "nestjs-pino";
import type { DestinationStream } from "pino";
import { parseConfiguration } from "./shared/config";
import { httpLoggerOptions } from "./shared/logging";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { EnvironmentModule } from "./modules/environment/environment.module";
import { SchoolsModule } from "./modules/schools/schools.module";
import { HealthController } from "./health.controller";
@Module({})
export class AppModule {
  static configure(
    config: ReturnType<typeof parseConfiguration>,
    destination?: DestinationStream,
  ): DynamicModule {
    const logger = httpLoggerOptions(config.LOG_LEVEL);
    let pinoHttp:
      | ReturnType<typeof httpLoggerOptions>
      | [ReturnType<typeof httpLoggerOptions>, DestinationStream] = logger;
    if (destination) pinoHttp = [logger, destination];
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => config] }),
        DatabaseModule.forRoot(config.DATABASE_URL),
        EnvironmentModule,
        SchoolsModule.forRoot(config),
        TerminusModule.forRoot({ logger: false }),
        LoggerModule.forRoot({ pinoHttp }),
      ],
      controllers: [HealthController],
    };
  }
}
