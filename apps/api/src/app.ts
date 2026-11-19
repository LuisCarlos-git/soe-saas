import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { parseConfiguration } from "./shared/config";
import type { createAuthentication } from "./modules/identity/factories/authentication.factory";
import { AUTHENTICATION } from "./modules/identity/identity.module";
import { Logger } from "nestjs-pino";
import {
  ZodValidationPipe,
  ZodSerializerInterceptor,
  cleanupOpenApiDoc,
} from "nestjs-zod";
import helmet from "helmet";
import express from "express";
import { authenticationHandler } from "./modules/identity/http/authentication-handler";
import type { DestinationStream } from "pino";
import { AppModule } from "./app.module";
import { documentAuthentication } from "./modules/identity/http/openapi-authentication";
import { LoginRequest, SafeErrorResponse } from "./common/dto/transport.dto";
import { SafeErrorFilter } from "./common/filters/safe-error.filter";

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
  app.getHttpAdapter().getInstance().set("trust proxy", false);
  app.use(helmet());
  app.use(express.json({ limit: "16kb" }));
  app.use(
    authenticationHandler(
      app.get<ReturnType<typeof createAuthentication>>(AUTHENTICATION),
      config,
      (event) => app.get(Logger).log(event),
    ),
  );
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new SafeErrorFilter());
  app.enableShutdownHooks();
  return app;
}

export function createOpenApi(app: Awaited<ReturnType<typeof createApi>>) {
  return documentAuthentication(
    cleanupOpenApiDoc(
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle("SOE synthetic environment")
          .setVersion("1")
          .addCookieAuth("soe.session_token")
          .build(),
        { extraModels: [LoginRequest, SafeErrorResponse] },
      ),
    ),
  );
}
