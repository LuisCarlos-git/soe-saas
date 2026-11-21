import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import { startTestPostgres } from "./support/postgres.mjs";
import { startTestMailpit } from "./support/mailpit.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";
import { totp } from "../../../scripts/test-totp.mjs";

let database, mailbox, app;
const origin = "http://127.0.0.1:43120";
const logs = [];
async function signInWithMfa(email) {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email, password: "12345678" })
    .expect(204);
  const setup = await agent
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(200);
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(setup.body.totpURI) })
    .expect(204);
  return agent;
}
beforeAll(async () => {
  [database, mailbox] = await Promise.all([
    startTestPostgres(),
    startTestMailpit(),
  ]);
  migrateTestDatabase(database.url);
  const { createApi } = await import("../dist/app.js");
  app = await createApi(
    {
      NODE_ENV: "test",
      DATABASE_URL: database.url,
      AUTH_RATE_MAX: 100,
      INVITATION_MAIL_MODE: "development-smtp",
      INVITATION_SMTP_HOST: mailbox.host,
      INVITATION_SMTP_PORT: mailbox.smtpPort,
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
  await Promise.all([database?.stop(), mailbox?.stop()]);
});

test("administrador envia convite com papel explícito pela caixa de e-mail real de desenvolvimento", async () => {
  const operator = await signInWithMfa("operator@example.test");
  const created = await operator
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send({
      name: "Escola Horizonte sintética",
      timeZone: "America/Sao_Paulo",
      academicYear: 2026,
      supportTeamLabel: "Orientação",
      studentLabel: "Estudante",
      classLabel: "Turma",
      initialAdministratorName: "Ana Responsável",
      initialAdministratorEmail: "ana@example.test",
    })
    .expect(201);
  const ana = await signInWithMfa("ana@example.test");
  const result = await ana
    .post(`/api/v1/schools/${created.body.id}/invitations`)
    .set("Origin", origin)
    .send({
      name: "Profissional sintético",
      email: "profissional@example.test",
      roles: ["TEACHER"],
    })
    .expect(201);
  expect(result.body).toMatchObject({
    email: "profissional@example.test",
    roles: ["TEACHER"],
    status: "PENDING",
  });
  let received;
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const response = await fetch(`${mailbox.baseUrl}/api/v1/messages`);
    const data = await response.json();
    received = data.messages.find((message) =>
      message.To?.some(
        (recipient) => recipient.Address === "profissional@example.test",
      ),
    );
    if (received) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  expect(Boolean(received)).toBe(true);
  const message = await (
    await fetch(`${mailbox.baseUrl}/api/v1/message/${received.ID}`)
  ).json();
  expect(message.Text.includes("Escola Horizonte sintética")).toBe(true);
  expect(message.Text.includes("/invitations/accept#")).toBe(true);
  expect(message.HTML.includes('lang="pt-BR"')).toBe(true);
  expect(message.HTML.includes("Aceitar convite")).toBe(true);
  expect(message.HTML.includes("Professor")).toBe(true);
  const listing = await ana
    .get(`/api/v1/schools/${created.body.id}/invitations`)
    .expect(200);
  expect(listing.body.invitations[0].deliveryStatus).toBe("SENT");
  expect(logs.join("")).not.toMatch(
    /profissional@example|tokenHash|tokenCiphertext|12345678/,
  );
  const link = message.Text.match(
    /https?:\/\/[^\s]+\/invitations\/accept#[A-Za-z0-9_-]+/,
  )[0];
  const token = new URL(link).hash.slice(1);
  const newcomer = request.agent(app.getHttpServer());
  const preview = await newcomer
    .post("/api/v1/invitations/preview")
    .set("Origin", origin)
    .send({ token })
    .expect(200);
  expect(preview.body).toMatchObject({
    name: "Profissional sintético",
    email: "profissional@example.test",
    roles: ["TEACHER"],
    registrationRequired: true,
  });
  await newcomer
    .post("/api/v1/invitations/register")
    .set("Origin", origin)
    .send({
      token,
      name: "Profissional sintético",
      password: "senha-sintetica-123",
    })
    .expect(204);
  await newcomer
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({
      email: "profissional@example.test",
      password: "senha-sintetica-123",
    })
    .expect(204);
  await newcomer
    .post("/api/v1/invitations/accept")
    .set("Origin", origin)
    .send({ token })
    .expect(204);
  const memberships = await newcomer
    .get("/api/v1/identity/memberships")
    .expect(200);
  expect(memberships.body.memberships).toEqual([
    {
      organizationId: created.body.id,
      name: "Escola Horizonte sintética",
      roles: ["TEACHER"],
    },
  ]);
  await newcomer
    .post("/api/v1/invitations/accept")
    .set("Origin", origin)
    .send({ token })
    .expect(410);
  await newcomer
    .get(`/api/v1/schools/${created.body.id}/invitations`)
    .expect(403);
  expect(
    (
      await ana
        .get(`/api/v1/schools/${created.body.id}/invitations`)
        .expect(200)
    ).body.invitations[0].status,
  ).toBe("ACCEPTED");
  expect(logs.join("").includes(token)).toBe(false);
});
