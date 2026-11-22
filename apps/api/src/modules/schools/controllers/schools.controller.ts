import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Headers,
  Header,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
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
  provisionSchoolSchema,
  updateSchoolSchema,
  schoolSchema,
  schoolAccessSchema,
  schoolListSchema,
  managedSchoolsSchema,
  managedSchoolsQuerySchema,
} from "@soe/contracts";
import { AUTHENTICATION } from "../../identity/authentication.token";
import type { createAuthentication } from "../../identity/factories/authentication.factory";
import { FindSchoolAccess } from "../use-cases/find-school-access.use-case";
import { ListPilotSchools } from "../use-cases/list-pilot-schools.use-case";
import { ListManagedSchools } from "../use-cases/list-managed-schools.use-case";
import { ProvisionSchool } from "../use-cases/provision-school.use-case";
import { ReadSchoolSettings } from "../use-cases/read-school-settings.use-case";
import { UpdateSchoolSettings } from "../use-cases/update-school-settings.use-case";
import {
  SchoolConflict,
  SchoolForbidden,
  SchoolNotFound,
} from "../domain/school";
export const SCHOOL_ORIGIN = Symbol("SCHOOL_ORIGIN");
class ProvisionRequest extends createZodDto(provisionSchoolSchema) {}
class UpdateRequest extends createZodDto(updateSchoolSchema) {}
class SchoolResponse extends createZodDto(schoolSchema) {}
class AccessResponse extends createZodDto(schoolAccessSchema) {}
class ListResponse extends createZodDto(schoolListSchema) {}
class ManagedSchoolsResponse extends createZodDto(managedSchoolsSchema) {}
class ManagedSchoolsQuery extends createZodDto(managedSchoolsQuerySchema) {}
class SchoolParams extends createZodDto(
  z.object({ organizationId: z.uuid() }),
) {}
class ListQuery extends createZodDto(
  z.strictObject({
    offset: z.coerce.number().int().min(0).max(100000).default(0),
  }),
) {}

@Controller("api/v1")
@ApiCookieAuth()
@ApiResponse({ status: 400, type: SafeErrorResponse })
@ApiResponse({ status: 401, type: SafeErrorResponse })
@ApiResponse({ status: 403, type: SafeErrorResponse })
@ApiResponse({ status: 404, type: SafeErrorResponse })
@ApiResponse({ status: 409, type: SafeErrorResponse })
@ApiResponse({ status: 503, type: SafeErrorResponse })
export class SchoolsController {
  constructor(
    @Inject(AUTHENTICATION)
    private readonly auth: ReturnType<typeof createAuthentication>,
    @Inject(FindSchoolAccess) private readonly findAccess: FindSchoolAccess,
    @Inject(ListPilotSchools) private readonly listSchools: ListPilotSchools,
    @Inject(ListManagedSchools)
    private readonly listManaged: ListManagedSchools,
    @Inject(ProvisionSchool) private readonly provisionSchool: ProvisionSchool,
    @Inject(ReadSchoolSettings)
    private readonly readSettings: ReadSchoolSettings,
    @Inject(UpdateSchoolSettings)
    private readonly updateSettings: UpdateSchoolSettings,
    @Inject(SCHOOL_ORIGIN) private readonly origin: string,
  ) {}
  private async actor(credential: string) {
    const actor = await this.auth.current.execute(credential);
    if (!actor) throw new UnauthorizedException();
    return actor.id;
  }
  private async run<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof SchoolForbidden) throw new ForbiddenException();
      if (error instanceof SchoolNotFound) throw new NotFoundException();
      if (error instanceof SchoolConflict) throw new ConflictException();
      throw error;
    }
  }
  private checkOrigin(origin?: string) {
    if (origin !== this.origin) throw new ForbiddenException();
  }
  @Get("identity/school-access")
  @ApiOkResponse({ type: AccessResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(AccessResponse)
  async access(@Headers("cookie") cookie = "") {
    return this.findAccess.execute(await this.actor(cookie));
  }
  @Get("administration/schools")
  @ApiOkResponse({ type: ListResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(ListResponse)
  async list(@Headers("cookie") cookie = "", @Query() query: ListQuery) {
    const actor = await this.actor(cookie);
    return this.run(() => this.listSchools.execute(actor, query.offset));
  }
  @Get("schools")
  @ApiOkResponse({ type: ManagedSchoolsResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(ManagedSchoolsResponse)
  async managed(
    @Headers("cookie") cookie = "",
    @Query() query: ManagedSchoolsQuery,
  ) {
    return this.run(async () =>
      this.listManaged.execute(await this.actor(cookie), query),
    );
  }
  @Post("administration/schools")
  @ApiCreatedResponse({ type: SchoolResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(SchoolResponse)
  async provision(
    @Headers("cookie") cookie = "",
    @Headers("origin") origin: string | undefined,
    @Body() input: ProvisionRequest,
  ) {
    this.checkOrigin(origin);
    const actor = await this.actor(cookie);
    const { initialAdministratorEmail, initialAdministratorName, ...settings } =
      input;
    return this.run(() =>
      this.provisionSchool.execute(
        actor,
        settings,
        initialAdministratorEmail,
        initialAdministratorName,
      ),
    );
  }
  @Get("schools/:organizationId/settings")
  @ApiOkResponse({ type: SchoolResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(SchoolResponse)
  async read(@Headers("cookie") cookie = "", @Param() params: SchoolParams) {
    const actor = await this.actor(cookie);
    return this.run(() =>
      this.readSettings.execute(actor, params.organizationId),
    );
  }
  @Patch("schools/:organizationId/settings")
  @ApiOkResponse({ type: SchoolResponse })
  @Header("Cache-Control", "no-store")
  @ZodSerializerDto(SchoolResponse)
  async update(
    @Headers("cookie") cookie = "",
    @Headers("origin") origin: string | undefined,
    @Param() params: SchoolParams,
    @Body() input: UpdateRequest,
  ) {
    this.checkOrigin(origin);
    const actor = await this.actor(cookie);
    const { version, ...settings } = input;
    return this.run(() =>
      this.updateSettings.execute(
        actor,
        params.organizationId,
        settings,
        version,
      ),
    );
  }
}
