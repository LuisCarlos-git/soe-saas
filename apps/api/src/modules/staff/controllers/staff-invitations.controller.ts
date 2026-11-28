import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Headers,
  Header,
  HttpCode,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from "@nestjs/swagger";
import { createZodDto, ZodSerializerDto } from "nestjs-zod";
import { z } from "zod";
import { SafeErrorResponse } from "../../../common/dto/transport.dto";
import {
  inviteProfessionalSchema,
  invitationSchema,
  invitationListSchema,
  invitationListQuerySchema,
} from "@soe/contracts";
import { AUTHENTICATION } from "../../identity/authentication.token";
import type { createAuthentication } from "../../identity/factories/authentication.factory";
import { InviteProfessional } from "../use-cases/invite-professional.use-case";
import { ListInvitations } from "../use-cases/list-invitations.use-case";
import {
  StaffConflict,
  StaffNotFound,
  InvitationMailUnavailable,
} from "../domain/staff";
export const STAFF_ORIGIN = Symbol("STAFF_ORIGIN");
class InvitationRequest extends createZodDto(inviteProfessionalSchema) {}
class InvitationResponse extends createZodDto(invitationSchema) {}
class InvitationListResponse extends createZodDto(invitationListSchema) {}
class SchoolParams extends createZodDto(
  z.object({ organizationId: z.uuid() }),
) {}
class ListQuery extends createZodDto(invitationListQuerySchema) {}
class PublicListQuery extends createZodDto(
  invitationListQuerySchema.omit({ search: true }),
) {}
@Controller("api/v1/schools/:organizationId/invitations")
@ApiCookieAuth()
@ApiResponse({ status: 400, type: SafeErrorResponse })
@ApiResponse({ status: 401, type: SafeErrorResponse })
@ApiResponse({ status: 403, type: SafeErrorResponse })
@ApiResponse({ status: 404, type: SafeErrorResponse })
@ApiResponse({ status: 500, type: SafeErrorResponse })
@ApiResponse({ status: 503, type: SafeErrorResponse })
export class StaffInvitationsController {
  constructor(
    @Inject(AUTHENTICATION)
    private readonly auth: ReturnType<typeof createAuthentication>,
    @Inject(InviteProfessional) private readonly invite: InviteProfessional,
    @Inject(ListInvitations) private readonly list: ListInvitations,
    @Inject(STAFF_ORIGIN) private readonly origin: string,
  ) {}
  private async actor(cookie: string) {
    const identity = await this.auth.current.execute(cookie);
    if (!identity) throw new UnauthorizedException();
    return identity.id;
  }
  private async run<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      if (error instanceof StaffNotFound) throw new NotFoundException();
      if (error instanceof StaffConflict) throw error;
      if (error instanceof InvitationMailUnavailable)
        throw new ServiceUnavailableException();
      throw error;
    }
  }
  @Post()
  @ApiCreatedResponse({ type: InvitationResponse })
  @ApiResponse({ status: 409, type: SafeErrorResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(InvitationResponse)
  async create(
    @Headers("cookie") cookie = "",
    @Headers("origin") origin: string | undefined,
    @Param() params: SchoolParams,
    @Body() input: InvitationRequest,
  ) {
    if (origin !== this.origin) throw new ForbiddenException();
    const actor = await this.actor(cookie);
    return this.run(() =>
      this.invite.execute(actor, params.organizationId, input),
    );
  }
  @Get()
  @ApiOkResponse({ type: InvitationListResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(InvitationListResponse)
  async read(
    @Headers("cookie") cookie = "",
    @Param() params: SchoolParams,
    @Query() query: PublicListQuery,
  ) {
    return this.search(cookie, params, { ...query, search: "" });
  }
  @Post("search")
  @HttpCode(200)
  @ApiOkResponse({ type: InvitationListResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(InvitationListResponse)
  async search(
    @Headers("cookie") cookie = "",
    @Param() params: SchoolParams,
    @Body() query: ListQuery,
  ) {
    const actor = await this.actor(cookie);
    return this.run(() =>
      this.list.execute(actor, params.organizationId, query),
    );
  }
}
