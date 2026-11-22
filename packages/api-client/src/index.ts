import {
  mfaEnrollmentSchema,
  mfaVerificationSchema,
  mfaSetupSchema,
  mfaStatusSchema,
  mfaChallengeSchema,
  environmentSchema,
  errorSchema,
  identitySchema,
  loginSchema,
  schoolAccessSchema,
  schoolListSchema,
  managedSchoolsSchema,
  managedSchoolsQuerySchema,
  type ManagedSchoolsQuery,
  schoolSchema,
  provisionSchoolSchema,
  updateSchoolSchema,
  invitationSchema,
  invitationListSchema,
  invitationListQuerySchema,
  type InvitationListQuery,
  inviteProfessionalSchema,
  invitationTokenSchema,
  invitationPreviewSchema,
  registerInvitedIdentitySchema,
  membershipsSchema,
} from "@soe/contracts";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export type ApiErrorHandler = (error: ApiError) => void;

// Transport stays framework-independent. Browser composition supplies the notification adapter.
export function createApiClient(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
  credential?: string,
  onError?: ApiErrorHandler,
) {
  function reject(error: ApiError): never {
    onError?.(error);
    throw error;
  }
  function rejectInvalidResponse(status: number): never {
    return reject(
      new ApiError(
        "Não foi possível concluir a solicitação. Tente novamente.",
        status,
        "INVALID_RESPONSE",
      ),
    );
  }
  async function send(url: string, options: RequestInit) {
    try {
      return await fetcher(url, {
        credentials: "same-origin",
        cache: "no-store",
        ...options,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      return reject(
        new ApiError(
          "Sem conexão com o serviço. Verifique a rede e tente novamente.",
          0,
          "NETWORK_ERROR",
        ),
      );
    }
  }
  async function check(response: Response) {
    if (response.ok) return;
    const body: unknown = await response.json().catch((error: unknown) => {
      if (error instanceof Error && error.name === "AbortError") throw error;
      return null;
    });
    const parsed = errorSchema.safeParse(body);
    if (parsed.success)
      return reject(
        new ApiError(parsed.data.message, response.status, parsed.data.code),
      );
    return rejectInvalidResponse(response.status);
  }
  async function readResponse<T>(
    response: Response,
    schema: { parse: (body: unknown) => T },
  ): Promise<T> {
    await check(response);
    try {
      return schema.parse(await response.json());
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      return rejectInvalidResponse(response.status);
    }
  }
  async function identity(signal?: AbortSignal) {
    const headers = new Headers();
    if (credential) headers.set("cookie", credential);
    const response = await send(`${baseUrl}/identity/session`, {
      headers,
      ...(signal && { signal }),
    });
    // Missing session is a normal authentication state, not an error notification.
    if (response.status === 401) return null;
    return readResponse(response, identitySchema);
  }
  async function access(path: string, body: unknown) {
    const response = await send(
      `${baseUrl.replace(/\/v1$/, "")}/auth/${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    await check(response);
    return response;
  }
  async function read<T>(
    path: string,
    schema: { parse: (body: unknown) => T },
    signal?: AbortSignal,
    input?: unknown,
  ) {
    const headers = new Headers({ Accept: "application/json" });
    if (credential) headers.set("cookie", credential);
    if (input !== undefined) headers.set("Content-Type", "application/json");
    return readResponse(
      await send(`${baseUrl}/${path}`, {
        headers,
        ...(input !== undefined && {
          method: "POST",
          body: JSON.stringify(input),
        }),
        ...(signal && { signal }),
      }),
      schema,
    );
  }
  async function saveSchool(
    path: string,
    method: "POST" | "PATCH",
    body: unknown,
  ) {
    return readResponse(
      await send(`${baseUrl}/${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      schoolSchema,
    );
  }
  async function invitationCommand(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ) {
    const response = await send(`${baseUrl}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...(signal && { signal }),
    });
    await check(response);
    return response;
  }
  return {
    identity,
    managedSchools: (
      options: Partial<ManagedSchoolsQuery> = {},
      signal?: AbortSignal,
    ) =>
      read(
        "schools/search",
        managedSchoolsSchema,
        signal,
        managedSchoolsQuerySchema.parse(options),
      ),
    invitations: (
      organizationId: string,
      options: Partial<InvitationListQuery> = {},
      signal?: AbortSignal,
    ) =>
      read(
        `schools/${encodeURIComponent(schoolSchema.shape.id.parse(organizationId))}/invitations/search`,
        invitationListSchema,
        signal,
        invitationListQuerySchema.parse(options),
      ),
    inviteProfessional: async (organizationId: string, input: unknown) =>
      readResponse(
        await invitationCommand(
          `schools/${encodeURIComponent(schoolSchema.shape.id.parse(organizationId))}/invitations`,
          inviteProfessionalSchema.parse(input),
        ),
        invitationSchema,
      ),
    previewInvitation: async (token: string, signal?: AbortSignal) =>
      readResponse(
        await invitationCommand(
          "invitations/preview",
          invitationTokenSchema.parse({ token }),
          signal,
        ),
        invitationPreviewSchema,
      ),
    registerInvitation: (input: unknown) =>
      invitationCommand(
        "invitations/register",
        registerInvitedIdentitySchema.parse(input),
      ),
    acceptInvitation: (token: string) =>
      invitationCommand(
        "invitations/accept",
        invitationTokenSchema.parse({ token }),
      ),
    memberships: (signal?: AbortSignal) =>
      read("identity/memberships", membershipsSchema, signal),
    schoolAccess: (signal?: AbortSignal) =>
      read("identity/school-access", schoolAccessSchema, signal),
    schools: (offset = 0, signal?: AbortSignal) =>
      read(`administration/schools?offset=${offset}`, schoolListSchema, signal),
    schoolSettings: (id: string, signal?: AbortSignal) =>
      read(
        `schools/${encodeURIComponent(schoolSchema.shape.id.parse(id))}/settings`,
        schoolSchema,
        signal,
      ),
    provisionSchool: (input: unknown) =>
      saveSchool(
        "administration/schools",
        "POST",
        provisionSchoolSchema.parse(input),
      ),
    updateSchool: (id: string, input: unknown) =>
      saveSchool(
        `schools/${encodeURIComponent(schoolSchema.shape.id.parse(id))}/settings`,
        "PATCH",
        updateSchoolSchema.parse(input),
      ),
    login: async (input: unknown) => {
      const response = await access("sign-in/email", loginSchema.parse(input));
      if (response.status === 204) return { twoFactorRedirect: false };
      return readResponse(response, mfaChallengeSchema);
    },
    enrollMfa: async (input: unknown) =>
      readResponse(
        await access("two-factor/enable", mfaEnrollmentSchema.parse(input)),
        mfaSetupSchema,
      ),
    verifyMfa: (input: unknown) =>
      access("two-factor/verify-totp", mfaVerificationSchema.parse(input)),
    mfaStatus: async () =>
      readResponse(await send(`${baseUrl}/identity/mfa`, {}), mfaStatusSchema),
    logout: () => access("sign-out", {}),
    async environment(signal?: AbortSignal) {
      const response = await send(`${baseUrl}/environment`, {
        headers: { Accept: "application/json" },
        ...(signal && { signal }),
      });
      return readResponse(response, environmentSchema);
    },
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
