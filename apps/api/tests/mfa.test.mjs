import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import pg from "pg";
import { totp } from "../../../scripts/test-totp.mjs";
import { startTestPostgres } from "./support/postgres.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";
let database, app;
const logs = [];
const origin = "http://127.0.0.1:43120";

beforeAll(async () => {
  database = await startTestPostgres();
  migrateTestDatabase(database.url);
  const { createApi } = await import("../dist/app.js");
  app = await createApi(
    {
      NODE_ENV: "test",
      DATABASE_URL: database.url,
      LOG_LEVEL: "info",
      AUTH_RATE_MAX: 100,
    },
    { write: (value) => logs.push(String(value)) },
  );
  await app.init();
  const { provisionTestIdentities } =
    await import("../dist/cli/synthetic-identities.js");
  await provisionTestIdentities(database.url, "test");
});
afterAll(async () => {
  await app?.close();
  await database?.stop();
});

test("dispensa local mantém senha, autorização e MFA persistido; desligar restaura exigência", async () => {
  const login = { email: "mfa-ana@example.test", password: "12345678" };
  const normal = request.agent(app.getHttpServer());
  await normal
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send(login)
    .expect(204);
  const setup = await normal
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: login.password })
    .expect(200);
  await normal
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(setup.body.totpURI) })
    .expect(204);
  await request(app.getHttpServer())
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send(login)
    .expect(200, { twoFactorRedirect: true });
  const { createApi } = await import("../dist/app.js");
  const local = await createApi({
    NODE_ENV: "development",
    DATABASE_URL: database.url,
    DEV_MFA_BYPASS: "true",
    AUTH_RATE_MAX: 100,
    LOG_LEVEL: "silent",
  });
  try {
    await local.init();
    const agent = request.agent(local.getHttpServer());
    await agent.get("/api/v1/schools").expect(401);
    await agent
      .post("/api/auth/sign-in/email")
      .set("Origin", "https://external.example.test")
      .send(login)
      .expect(403);
    await agent
      .post("/api/auth/sign-in/email")
      .set("Origin", origin)
      .send({ ...login, password: "wrong-password" })
      .expect(401);
    const signedIn = await agent
      .post("/api/auth/sign-in/email")
      .set("Origin", origin)
      .send(login)
      .expect(204);
    expect((await agent.get("/api/v1/identity/mfa").expect(200)).body).toEqual({
      enabled: true,
      verified: true,
      developmentBypass: true,
    });
    expect(
      (await agent.get("/api/v1/schools").expect(200)).body.schools,
    ).toEqual([]);
    await agent.get("/api/v1/administration/schools").expect(403);
    const cookie = signedIn.headers["set-cookie"]
      .find((value) => value.startsWith("soe.session_token="))
      .split(";")[0];
    const restored = await request(app.getHttpServer())
      .get("/api/v1/identity/mfa")
      .set("Cookie", cookie)
      .expect(200);
    expect(restored.body).toEqual({ enabled: true, verified: false });
    await request(app.getHttpServer())
      .get("/api/v1/schools")
      .set("Cookie", cookie)
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/auth/sign-in/email")
      .set("Origin", origin)
      .send(login)
      .expect(200, { twoFactorRedirect: true });
  } finally {
    await local.close();
  }
});
test("MFA por HTTP exige inscrição verificada e não aceita sessões antigas ou desafio inválido", async () => {
  const api = () => request(app.getHttpServer());
  const agent = request.agent(app.getHttpServer());
  const login = { email: "ana@example.test", password: "12345678" };
  const old = await api()
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send(login);
  const oldCookie = old.headers["set-cookie"]
    .find((c) => c.startsWith("soe.session_token="))
    .split(";")[0];
  await agent
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send(login)
    .expect(204);
  const state = await agent.get("/api/v1/identity/mfa").expect(200);
  expect(state.body).toEqual({ enabled: false, verified: false });
  await agent.get("/api/v1/administration").expect(403);
  const enrollment = await agent
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(200);
  expect(enrollment.body).toEqual({
    totpURI: expect.stringMatching(/^otpauth:\/\//),
  });
  expect(new URL(enrollment.body.totpURI).searchParams.get("issuer")).toBe(
    "SOe",
  );
  const code = totp(enrollment.body.totpURI);
  const invalid = code === "000000" ? "000001" : "000000";
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: invalid })
    .expect(401);
  await agent.get("/api/v1/administration").expect(403);
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code, trustDevice: true })
    .expect(400);
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code })
    .expect(204);
  expect((await agent.get("/api/v1/identity/mfa").expect(200)).body).toEqual({
    enabled: true,
    verified: true,
  });
  // No administration resource exists yet; passing MFA never creates permission/resource.
  await agent.get("/api/v1/administration").expect(404);
  await api()
    .get("/api/v1/administration")
    .set("Cookie", oldCookie)
    .expect(403);
  expect(
    (
      await api()
        .get("/api/v1/identity/mfa")
        .set("Cookie", oldCookie)
        .expect(200)
    ).body,
  ).toEqual({ enabled: true, verified: false });
  const second = request.agent(app.getHttpServer());
  const challenge = await second
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send(login)
    .expect(200);
  expect(challenge.body).toEqual({ twoFactorRedirect: true });
  await second.get("/api/v1/identity/session").expect(401);
  await second
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: invalid })
    .expect(401);
  await second.get("/api/v1/identity/session").expect(401);
  await second
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(enrollment.body.totpURI) })
    .expect(204);
  expect(
    (await second.get("/api/v1/identity/mfa").expect(200)).body.verified,
  ).toBe(true);
  await second
    .post("/api/auth/two-factor/disable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(404);
  await second
    .post("/api/auth/two-factor/verify-backup-code")
    .set("Origin", origin)
    .send({ code: "unused" })
    .expect(404);
  const bia = request.agent(app.getHttpServer());
  await bia
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email: "bia@example.test", password: "12345678" })
    .expect(204);
  expect((await bia.get("/api/v1/identity/mfa").expect(200)).body).toEqual({
    enabled: false,
    verified: false,
  });
  await api()
    .get("/API/v1/administration")
    .set("Cookie", oldCookie)
    .expect(403);
  await api()
    .post("/api/auth/two-factor/enable")
    .set("Origin", "https://attacker.example")
    .set("Cookie", oldCookie)
    .send({ password: "12345678" })
    .expect(403);
  // Audit is deliberately not exposed over HTTP. Inspect only its safe technical events.
  const audit = new pg.Client({ connectionString: database.url });
  try {
    await audit.connect();
    const events = await audit.query(
      `SELECT action FROM authentication_audit WHERE action LIKE 'MFA_%' AND "userId"=(SELECT id FROM "user" WHERE email=$1) ORDER BY "occurredAt"`,
      [login.email],
    );
    expect(events.rows.map((row) => row.action)).toEqual([
      "MFA_ENABLED",
      "MFA_VERIFIED",
      "MFA_VERIFIED",
    ]);
  } finally {
    await audit.end();
  }
  expect(logs.join("")).not.toMatch(
    /12345678|ana@example|otpauth|session_token|backupCodes/,
  );
  expect(logs.join("")).not.toContain(
    new URL(enrollment.body.totpURI).searchParams.get("secret"),
  );
});
