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
import { identitySchema } from "@soe/contracts";
import { createZodDto, ZodSerializerDto } from "nestjs-zod";
class IdentityResponse extends createZodDto(identitySchema) {}
@Controller("api/v1/identity")
export class IdentityController {
  constructor(
    @Inject(CurrentIdentity) private readonly current: CurrentIdentity,
  ) {}
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
