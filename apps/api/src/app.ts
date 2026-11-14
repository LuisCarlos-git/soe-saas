import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { parseConfiguration } from "@soe/backend";
import { Logger } from "nestjs-pino";
import {
  ZodValidationPipe,
  ZodSerializerInterceptor,
  cleanupOpenApiDoc,
} from "nestjs-zod";
import helmet from "helmet";
import type { DestinationStream } from "pino";
import { AppModule } from "./app.module.js";
import { SafeErrorFilter } from "./error.filter.js";

export async function createApi(
  input: unknown,
  destination?: DestinationStream,
) {
  const config = parseConfiguration(input);
  const app = await NestFactory.create(
    AppModule.configure(config, destination),
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new SafeErrorFilter());
  app.enableShutdownHooks();
  return app;
}

export function createOpenApi(app: Awaited<ReturnType<typeof createApi>>) {
  return cleanupOpenApiDoc(
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("SOE synthetic environment")
        .setVersion("1")
        .build(),
    ),
  );
}
