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
import { HealthResponse, SafeErrorResponse } from "./common/dto/transport.dto";
import { CheckReadiness } from "./modules/environment/use-cases/check-readiness.use-case";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(CheckReadiness) private readonly readiness: CheckReadiness,
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
          if (!(await this.readiness.execute()))
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
