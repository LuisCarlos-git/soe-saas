import {
  Controller,
  Get,
  Headers,
  Inject,
  UnauthorizedException,
  Header,
} from "@nestjs/common";
import { CurrentIdentity } from "../use-cases/current-identity.use-case";
import { ApiResponse, ApiCookieAuth, ApiOkResponse } from "@nestjs/swagger";
import { SafeErrorResponse } from "../../../common/dto/transport.dto";
import type { createAuthentication } from "../factories/authentication.factory";
import { AUTHENTICATION } from "../authentication.token";
import { mfaStatusSchema, identitySchema } from "@soe/contracts";
import { createZodDto, ZodSerializerDto } from "nestjs-zod";
class MfaStatusResponse extends createZodDto(mfaStatusSchema) {}
class IdentityResponse extends createZodDto(identitySchema) {}
@Controller("api/v1/identity")
export class IdentityController {
  constructor(
    @Inject(AUTHENTICATION)
    private readonly auth: ReturnType<typeof createAuthentication>,
    @Inject(CurrentIdentity) private readonly current: CurrentIdentity,
  ) {}
  @Get("mfa")
  @ApiCookieAuth()
  @ApiOkResponse({ type: MfaStatusResponse })
  @ApiResponse({ status: 401, type: SafeErrorResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(MfaStatusResponse)
  async mfa(@Headers("cookie") credential = "") {
    const status = await this.auth.security.execute(credential);
    if (!status) throw new UnauthorizedException();
    return status;
  }
  @Get("session")
  @ApiCookieAuth()
  @ApiOkResponse({ type: IdentityResponse })
  @ApiResponse({ status: 401, type: SafeErrorResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(IdentityResponse)
  async session(@Headers("cookie") credential = ""): Promise<IdentityResponse> {
    const identity = await this.current.execute(credential);
    if (!identity) throw new UnauthorizedException();
    return identity;
  }
}
