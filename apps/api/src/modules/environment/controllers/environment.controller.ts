import { Controller, Get, Header, Inject, Query } from "@nestjs/common";
import { ReadEnvironment } from "../use-cases/read-environment.use-case";
import { environmentQuerySchema, environmentSchema } from "@soe/contracts";
import { createZodDto, ZodResponse } from "nestjs-zod";
import {
  ApiBadRequestResponse,
  ApiPayloadTooLargeResponse,
  ApiServiceUnavailableResponse,
} from "@nestjs/swagger";
import { SafeErrorResponse } from "../../../common/dto/transport.dto";

class EnvironmentQuery extends createZodDto(environmentQuerySchema) {}
class EnvironmentResponse extends createZodDto(environmentSchema) {}

@Controller("api/v1/environment")
export class EnvironmentController {
  constructor(
    @Inject(ReadEnvironment) private readonly read: ReadEnvironment,
  ) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @ZodResponse({ type: EnvironmentResponse, status: 200 })
  @ApiBadRequestResponse({ type: SafeErrorResponse })
  @ApiPayloadTooLargeResponse({ type: SafeErrorResponse })
  @ApiServiceUnavailableResponse({ type: SafeErrorResponse })
  get(@Query() _query: EnvironmentQuery) {
    void _query;
    return this.read.execute();
  }
}
