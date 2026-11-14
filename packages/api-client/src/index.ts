import { environmentSchema, errorSchema } from "@soe/contracts";

export function createApiClient(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
) {
  return {
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
