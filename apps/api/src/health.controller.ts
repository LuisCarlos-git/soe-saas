import {
  Controller,
  Get,
  Header,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { HealthCheckService } from "@nestjs/terminus";
import { ApiServiceUnavailableResponse } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { HealthResponse, SafeErrorResponse } from "./transport.dto.js";
import { ENVIRONMENT_PROBE, type EnvironmentProbe } from "@soe/backend";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(ENVIRONMENT_PROBE) private readonly probe: EnvironmentProbe,
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
  ) {}

  @Get("live")
  @ZodResponse({ type: HealthResponse, status: 200 })
  @Header("Cache-Control", "no-store")
  live() {
    return { status: "ok" as const };
  }

  @Get("ready")
  @Header("Cache-Control", "no-store")
  @ZodResponse({ type: HealthResponse, status: 200 })
  @ApiServiceUnavailableResponse({ type: SafeErrorResponse })
  async ready() {
    try {
      await this.health.check([
        async () => {
          if (!(await this.probe.ready()))
            throw new ServiceUnavailableException();
          return { database: { status: "up" } };
        },
      ]);
      return { status: "ok" as const };
    } catch {
      throw new ServiceUnavailableException();
    }
  }
}
