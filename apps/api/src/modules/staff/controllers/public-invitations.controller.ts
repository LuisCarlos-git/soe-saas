import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  Header,
  HttpCode,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiResponse,
} from "@nestjs/swagger";
import { createZodDto, ZodSerializerDto } from "nestjs-zod";
import { SafeErrorResponse } from "../../../common/dto/transport.dto";
import {
  invitationTokenSchema,
  registerInvitedIdentitySchema,
  invitationPreviewSchema,
  membershipsSchema,
} from "@soe/contracts";
import { AUTHENTICATION } from "../../identity/authentication.token";
import type { createAuthentication } from "../../identity/factories/authentication.factory";
import { InvitationMail } from "../infrastructure/invitation-mail";
import { PreviewInvitation } from "../use-cases/preview-invitation.use-case";
import { RegisterInvitedIdentity } from "../use-cases/register-invited-identity.use-case";
import { AcceptInvitation } from "../use-cases/accept-invitation.use-case";
import { ReadOwnMemberships } from "../use-cases/read-own-memberships.use-case";
import { STAFF_ORIGIN } from "./staff-invitations.controller";
class TokenRequest extends createZodDto(invitationTokenSchema) {}
class RegistrationRequest extends createZodDto(registerInvitedIdentitySchema) {}
class PreviewResponse extends createZodDto(invitationPreviewSchema) {}
class MembershipsResponse extends createZodDto(membershipsSchema) {}
@Controller("api/v1/invitations")
@UseGuards(ThrottlerGuard)
@ApiResponse({ status: 400, type: SafeErrorResponse })
@ApiResponse({ status: 403, type: SafeErrorResponse })
@ApiResponse({ status: 410, type: SafeErrorResponse })
@ApiResponse({ status: 429, type: SafeErrorResponse })
@ApiResponse({ status: 500, type: SafeErrorResponse })
export class PublicInvitationsController {
  constructor(
    @Inject(AUTHENTICATION)
    private readonly auth: ReturnType<typeof createAuthentication>,
    @Inject(InvitationMail) private readonly mail: InvitationMail,
    @Inject(PreviewInvitation)
    private readonly previewInvitation: PreviewInvitation,
    @Inject(RegisterInvitedIdentity)
    private readonly registerIdentity: RegisterInvitedIdentity,
    @Inject(AcceptInvitation)
    private readonly acceptInvitation: AcceptInvitation,
    @Inject(STAFF_ORIGIN) private readonly origin: string,
  ) {}
  private checkOrigin(origin?: string) {
    if (origin !== this.origin) throw new ForbiddenException();
  }
  @Post("preview")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({ type: PreviewResponse })
  @ZodSerializerDto(PreviewResponse)
  preview(
    @Headers("origin") origin: string | undefined,
    @Body() input: TokenRequest,
  ) {
    this.checkOrigin(origin);
    return this.previewInvitation.execute(this.mail.secrets.hash(input.token));
  }
  @Post("register")
  @ApiResponse({ status: 409, type: SafeErrorResponse })
  @HttpCode(204)
  @Header("Cache-Control", "no-store")
  @ApiNoContentResponse()
  async register(
    @Headers("origin") origin: string | undefined,
    @Body() input: RegistrationRequest,
  ) {
    this.checkOrigin(origin);
    await this.registerIdentity.execute(
      this.mail.secrets.hash(input.token),
      input.name,
      input.password,
    );
  }
  @Post("accept")
  @ApiCookieAuth()
  @ApiResponse({ status: 401, type: SafeErrorResponse })
  @ApiResponse({ status: 409, type: SafeErrorResponse })
  @HttpCode(204)
  @Header("Cache-Control", "no-store")
  @ApiNoContentResponse()
  async accept(
    @Headers("cookie") cookie = "",
    @Headers("origin") origin: string | undefined,
    @Body() input: TokenRequest,
  ) {
    this.checkOrigin(origin);
    const actor = await this.auth.current.execute(cookie);
    const mfa = await this.auth.security.execute(cookie);
    if (!actor || !mfa) throw new UnauthorizedException();
    await this.acceptInvitation.execute(this.mail.secrets.hash(input.token), {
      id: actor.id,
      email: actor.email,
      mfaVerified: mfa.verified,
    });
  }
}
@Controller("api/v1/identity")
@ApiCookieAuth()
@ApiResponse({ status: 401, type: SafeErrorResponse })
@ApiResponse({ status: 500, type: SafeErrorResponse })
export class MembershipsController {
  constructor(
    @Inject(AUTHENTICATION)
    private readonly auth: ReturnType<typeof createAuthentication>,
    @Inject(ReadOwnMemberships) private readonly read: ReadOwnMemberships,
  ) {}
  @Get("memberships")
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({ type: MembershipsResponse })
  @ZodSerializerDto(MembershipsResponse)
  async memberships(@Headers("cookie") cookie = "") {
    const actor = await this.auth.current.execute(cookie);
    if (!actor) throw new UnauthorizedException();
    return this.read.execute(actor.id);
  }
}
