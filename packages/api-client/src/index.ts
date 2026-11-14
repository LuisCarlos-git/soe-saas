import {
  environmentSchema,
  errorSchema,
  identitySchema,
  loginSchema,
} from "@soe/contracts";

export function createApiClient(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
  credential?: string,
) {
  async function identity(signal?: AbortSignal) {
    const response = await fetcher(`${baseUrl}/identity/session`, {
      ...(signal ? { signal } : {}),
      headers: credential ? { cookie: credential } : {},
      credentials: "same-origin",
      cache: "no-store",
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("Não foi possível consultar sua sessão.");
    return identitySchema.parse(await response.json());
  }
  async function access(path: string, body: unknown) {
    const response = await fetcher(
      `${baseUrl.replace(/\/v1$/, "")}/auth/${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      const parsed = errorSchema.safeParse(await response.json());
      throw new Error(
        parsed.success
          ? parsed.data.message
          : "Não foi possível acessar. Tente novamente.",
      );
    }
  }
  return {
    identity,
    login: (input: unknown) =>
      access("sign-in/email", loginSchema.parse(input)),
    logout: () => access("sign-out", {}),
    async environment(signal?: AbortSignal) {
      const response = await fetcher(`${baseUrl}/environment`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        ...(signal ? { signal } : {}),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const error = errorSchema.safeParse(body);
        throw new Error(
          error.success
            ? error.data.message
            : "Não foi possível verificar o ambiente.",
        );
      }
      return environmentSchema.parse(body);
    },
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
