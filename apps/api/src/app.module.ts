import { Module, type DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TerminusModule } from "@nestjs/terminus";
import {
  EnvironmentModule,
  httpLoggerOptions,
  type parseConfiguration,
} from "@soe/backend";
import { LoggerModule } from "nestjs-pino";
import type { DestinationStream } from "pino";
import { EnvironmentController } from "./environment.controller.js";
import { HealthController } from "./health.controller.js";

@Module({})
export class AppModule {
  static configure(
    config: ReturnType<typeof parseConfiguration>,
    destination?: DestinationStream,
  ): DynamicModule {
    const logger = httpLoggerOptions(config.LOG_LEVEL);
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => config] }),
        EnvironmentModule.forRoot(config.DATABASE_URL),
        TerminusModule.forRoot({ logger: false }),
        LoggerModule.forRoot({
          pinoHttp: destination ? [logger, destination] : logger,
        }),
      ],
      controllers: [EnvironmentController, HealthController],
    };
  }
}
