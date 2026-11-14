import { expect, test } from "vitest";
import { ApiError, createApiClient } from "./index.js";

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
