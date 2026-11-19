import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import pg from "pg";
import { createHmac } from "node:crypto";
import { startTestPostgres } from "./support/postgres.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";
let database, app;
const logs = [];
const origin = "http://127.0.0.1:43120";
// Independent RFC 6238 implementation: never read a secret from persistence.
export function totp(uri) {
  const secret = new URL(uri).searchParams.get("secret");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = [...secret.replace(/=+$/, "")]
    .map((c) => alphabet.indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[19] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
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
      `SELECT action FROM authentication_audit WHERE action LIKE 'MFA_%' ORDER BY "occurredAt"`,
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
