import { expect, test } from "vitest";
import { ApiError, createApiClient } from "./index.js";

test("buscas sensíveis usam corpo POST, preservando credencial SSR e cancelamento", async () => {
  const calls: { url: string; options: RequestInit | undefined }[] = [];
  const signal = new AbortController().signal;
  const client = createApiClient(
    "/api/v1",
    async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({
        ...(String(url).includes("/invitations/")
          ? { invitations: [] }
          : { schools: [] }),
        total: 0,
        hasMore: false,
      });
    },
    "synthetic-session",
  );
  await client.managedSchools({ search: "Nome privado" }, signal);
  await client.invitations(
    "00000000-0000-4000-8000-000000000001",
    { search: "private@example.test" },
    signal,
  );
  for (const [index, call] of calls.entries()) {
    expect(call.url).not.toContain("?");
    expect(call.url).toMatch(/\/search$/);
    expect(call.options?.method).toBe("POST");
    expect(call.options?.signal).toBe(signal);
    expect(new Headers(call.options?.headers).get("cookie")).toBe(
      "synthetic-session",
    );
    expect(JSON.parse(String(call.options?.body)).search).toBe(
      index === 0 ? "Nome privado" : "private@example.test",
    );
  }
});

test("erros HTTP usam o callback padrão uma única vez com a mensagem segura", async () => {
  const notices: ApiError[] = [];
  const client = createApiClient(
    "/api/v1",
    async () =>
      new Response(
        JSON.stringify({
          code: "INVALID_CREDENTIALS",
          message: "E-mail ou senha inválidos.",
          correlationId: "00000000-0000-4000-8000-000000000001",
        }),
        { status: 401 },
      ),
    undefined,
    (error) => notices.push(error),
  );
  await expect(
    client.login({ email: "ana@example.test", password: "12345678" }),
  ).rejects.toThrow("E-mail ou senha inválidos.");
  expect(notices).toHaveLength(1);
  expect(notices[0]).toMatchObject({
    status: 401,
    code: "INVALID_CREDENTIALS",
  });
});

test("sessão ausente é estado normal; cancelamento não publica erro", async () => {
  const notices: ApiError[] = [];
  const client = createApiClient(
    "/api/v1",
    async () => new Response(null, { status: 401 }),
    undefined,
    (error) => notices.push(error),
  );
  expect(await client.identity()).toBeNull();
  const cancelled = createApiClient(
    "/api/v1",
    async () => {
      throw new DOMException("aborted", "AbortError");
    },
    undefined,
    (error) => notices.push(error),
  );
  await expect(cancelled.environment()).rejects.toThrow("aborted");
  expect(notices).toEqual([]);
});

test("resposta inesperada e falha de rede não refletem conteúdo técnico", async () => {
  const notices: ApiError[] = [];
  const invalid = createApiClient(
    "/api/v1",
    async () => new Response("PRIVATE_STACK", { status: 500 }),
    undefined,
    (error) => notices.push(error),
  );
  await expect(invalid.logout()).rejects.toBeInstanceOf(ApiError);
  const offline = createApiClient(
    "/api/v1",
    async () => {
      throw new Error("PRIVATE_INTERNAL_URL");
    },
    undefined,
    (error) => notices.push(error),
  );
  await expect(offline.logout()).rejects.toThrow("Sem conexão");
  expect(notices.map((error) => error.message).join()).not.toContain(
    "PRIVATE_",
  );
});

for (const method of ["identity", "environment"] as const) {
  test.each([
    { name: "JSON inválido", body: "PRIVATE_INVALID_JSON" },
    {
      name: "schema inválido",
      body: JSON.stringify({ private: "PRIVATE_DATA" }),
    },
    { name: "corpo ausente", body: null },
  ])(
    `${method}: HTTP 200 com $name produz um único erro seguro`,
    async ({ body }) => {
      const notices: ApiError[] = [];
      const client = createApiClient(
        "/api/v1",
        async () => new Response(body, { status: 200 }),
        undefined,
        (error) => notices.push(error),
      );

      await expect(client[method]()).rejects.toBeInstanceOf(ApiError);
      expect(notices).toHaveLength(1);
      expect(notices[0]).toMatchObject({
        name: "ApiError",
        status: 200,
        code: "INVALID_RESPONSE",
        message: "Não foi possível concluir a solicitação. Tente novamente.",
      });
      expect(JSON.stringify(notices)).not.toContain("PRIVATE_");
    },
  );

  test.each([200, 503])(
    `${method}: cancelamento ao ler HTTP %i não notifica`,
    async (status) => {
      const notices: ApiError[] = [];
      const aborted = new DOMException("Leitura cancelada", "AbortError");
      const client = createApiClient(
        "/api/v1",
        async () =>
          new Response(
            new ReadableStream({
              start(controller) {
                controller.error(aborted);
              },
            }),
            { status },
          ),
        undefined,
        (error) => notices.push(error),
      );

      await expect(client[method]()).rejects.toBe(aborted);
      expect(notices).toEqual([]);
    },
  );
}

test.each([
  {
    method: "identity" as const,
    body: { id: "synthetic", name: "Ana Teste", email: "ana@example.test" },
  },
  {
    method: "environment" as const,
    body: { status: "ok", sample: "Ambiente sintético" },
  },
])(
  "$method retorna a resposta válida sem notificar",
  async ({ method, body }) => {
    const notices: ApiError[] = [];
    const client = createApiClient(
      "/api/v1",
      async () => Response.json(body),
      undefined,
      (error) => notices.push(error),
    );

    await expect(client[method]()).resolves.toEqual(body);
    expect(notices).toEqual([]);
  },
);
