import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import { startTestPostgres } from "./support/postgres.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";
let database, app;
beforeAll(async () => {
  database = await startTestPostgres();
  migrateTestDatabase(database.url);
  const { createApi } = await import("../dist/app.js");
  app = await createApi({
    NODE_ENV: "test",
    DATABASE_URL: database.url,
    LOG_LEVEL: "silent",
  });
  await app.init();
  const { provisionTestIdentities } =
    await import("../dist/cli/synthetic-identities.js");
  await provisionTestIdentities(database.url, "test");
  await provisionTestIdentities(database.url, "test");
});
afterAll(async () => {
  await app?.close();
  await database?.stop();
});
test("sessão ausente não autoriza a identificação do profissional", async () => {
  const result = await request(app.getHttpServer()).get(
    "/api/v1/identity/session",
  );
  expect(result.status).toBe(401);
  expect(result.body).toMatchObject({ code: "AUTH_REQUIRED" });
  expect(result.headers["cache-control"]).toBe("no-store");
});

test("entrar permite leitura mínima; sair revoga inclusive o cookie copiado", async () => {
  const login = await request(app.getHttpServer())
    .post("/api/auth/sign-in/email")
    .set("Origin", "http://127.0.0.1:43120")
    .send({ email: "ana@example.test", password: "12345678" });
  expect(login.status).toBe(204);
  expect(login.text).toBe("");
  expect(login.headers["cache-control"]).toBe("no-store");
  const cookie = login.headers["set-cookie"].find((value) =>
    value.includes("session_token"),
  );
  expect(cookie).toMatch(/HttpOnly/i);
  expect(cookie).toMatch(/SameSite=Lax/i);
  const credential = cookie.split(";")[0];
  const session = await request(app.getHttpServer())
    .get("/api/v1/identity/session")
    .set("Cookie", credential);
  expect(session.status).toBe(200);
  expect(session.body).toEqual({
    id: expect.any(String),
    name: "Ana Teste",
    email: "ana@example.test",
  });
  const logout = await request(app.getHttpServer())
    .post("/api/auth/sign-out")
    .set("Origin", "http://127.0.0.1:43120")
    .set("Cookie", credential)
    .send({});
  expect(logout.status).toBe(204);
  const replay = await request(app.getHttpServer())
    .get("/api/v1/identity/session")
    .set("Cookie", credential);
  expect(replay.status).toBe(401);
});

test("origem não confiável e cadastro público são bloqueados", async () => {
  const input = { email: "ana@example.test", password: "12345678" };
  for (const origin of ["https://attacker.example", "null"]) {
    const result = await request(app.getHttpServer())
      .post("/api/auth/sign-in/email")
      .set("Origin", origin)
      .send(input);
    expect(result.status).toBe(403);
  }
  const absent = await request(app.getHttpServer())
    .post("/api/auth/sign-out")
    .send({});
  expect(absent.status).toBe(403);
  const signup = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .set("Origin", "http://127.0.0.1:43120")
    .send(input);
  expect(signup.status).toBe(404);
});

test("conta inexistente e senha incorreta têm a mesma resposta segura", async () => {
  const failures = [];
  for (const email of ["missing@example.test", "ana@example.test"]) {
    const result = await request(app.getHttpServer())
      .post("/api/auth/sign-in/email")
      .set("Origin", "http://127.0.0.1:43120")
      .send({ email, password: "PRIVATE_WRONG_PASSWORD" });
    expect(result.status).toBe(401);
    expect(result.headers["set-cookie"]).toBeUndefined();
    failures.push({ code: result.body.code, message: result.body.message });
  }
  expect(failures[0]).toEqual(failures[1]);
});

test("limite persiste entre instâncias e IP encaminhado forjado não o contorna", async () => {
  const { createApi } = await import("../dist/app.js");
  const config = {
    NODE_ENV: "test",
    DATABASE_URL: database.url,
    LOG_LEVEL: "silent",
    AUTH_RATE_MAX: 1,
    AUTH_RATE_WINDOW: 1,
  };
  const first = await createApi(config);
  const second = await createApi(config);
  try {
    await first.init();
    await second.init();
    // Prior attempts expire before this isolated one-second window.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const responses = await Promise.all(
      [first, second].map((instance, index) =>
        request(instance.getHttpServer())
          .post("/api/auth/sign-in/email")
          .set("Origin", "http://127.0.0.1:43120")
          .set("x-forwarded-for", `203.0.113.${index}`)
          .set("x-soe-client-ip", `198.51.100.${index}`)
          .send({
            email: "missing@example.test",
            password: "PRIVATE_WRONG_PASSWORD",
          }),
      ),
    );
    expect(responses.map((result) => result.status).sort()).toEqual([401, 429]);
    expect(
      responses.find((result) => result.status === 429).headers["retry-after"],
    ).toBeDefined();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const recovered = await request(first.getHttpServer())
      .post("/api/auth/sign-in/email")
      .set("Origin", "http://127.0.0.1:43120")
      .send({ email: "missing@example.test", password: "wrong" });
    expect(recovered.status).toBe(401);
  } finally {
    await first.close();
    await second.close();
  }
});

test("produção exige HTTPS e segredo próprio; cookie é Secure e nunca retorna token no JSON", async () => {
  const { createApi } = await import("../dist/app.js");
  await expect(
    createApi({ NODE_ENV: "production", DATABASE_URL: database.url }),
  ).rejects.toThrow("AUTH_SECRET");
  const logs = [];
  const production = await createApi(
    {
      NODE_ENV: "production",
      DATABASE_URL: database.url,
      AUTH_ORIGIN: "https://soe.example.test",
      AUTH_SECRET: "a-synthetic-secret-only-for-production-cookie-test",
      LOG_LEVEL: "info",
      AUTH_RATE_MAX: 100,
    },
    { write: (value) => logs.push(String(value)) },
  );
  try {
    await production.init();
    const response = await request(production.getHttpServer())
      .post("/api/auth/sign-in/email")
      .set("Origin", "https://soe.example.test")
      .set("Authorization", "PRIVATE_TOKEN")
      .send({ email: "ana@example.test", password: "12345678" });
    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"].join(" ")).toMatch(
      /__Secure-soe\.session_token=.*; HttpOnly; Secure; SameSite=Lax/i,
    );
    expect(response.text).toBe("");
    const { createOpenApi } = await import("../dist/app.js");
    const document = createOpenApi(production);
    expect(
      document.paths["/api/auth/sign-in/email"].post.responses["429"],
    ).toBeDefined();
    expect(
      document.paths["/api/auth/sign-out"].post.responses["204"],
    ).toBeDefined();
    expect(
      document.components.schemas.LoginRequest.properties.password,
    ).toBeDefined();
    const serialized = logs.join("");
    expect(serialized).not.toMatch(
      /12345678|ana@example|PRIVATE_TOKEN|session_token/,
    );
  } finally {
    await production.close();
  }
});

test("provisionamento local recusa produção e bancos fora do Compose", async () => {
  const { provisionDevelopmentIdentities } =
    await import("../dist/cli/synthetic-identities.js");
  for (const [url, environment] of [
    ["postgresql://soe:unused@127.0.0.1:54329/soe_dev", "production"],
    ["postgresql://soe:unused@remote.example:54329/soe_dev", "development"],
    ["postgresql://soe:unused@127.0.0.1:54329/real", "development"],
  ])
    await expect(
      provisionDevelopmentIdentities(url, environment),
    ).rejects.toThrow("local development database");
});
