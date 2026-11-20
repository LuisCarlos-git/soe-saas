import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import pg from "pg";
import { totp } from "../../../scripts/test-totp.mjs";
import { startTestPostgres } from "./support/postgres.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";

let database, app;
const origin = "http://127.0.0.1:43120";

beforeAll(async () => {
  database = await startTestPostgres();
  migrateTestDatabase(database.url);
  const { createApi } = await import("../dist/app.js");
  app = await createApi({
    NODE_ENV: "test",
    DATABASE_URL: database.url,
    LOG_LEVEL: "silent",
    AUTH_RATE_MAX: 100,
  });
  await app.init();
  const { provisionTestIdentities } =
    await import("../dist/cli/synthetic-identities.js");
  await provisionTestIdentities(database.url, "test");
});
afterAll(async () => {
  await app?.close();
  await database?.stop();
});

const school = {
  name: "Escola Horizonte — sintética",
  timeZone: "America/Sao_Paulo",
  academicYear: 2026,
  supportTeamLabel: "Orientação educacional",
  studentLabel: "Estudante",
  classLabel: "Turma",
  initialAdministratorEmail: "ana@example.test",
  initialAdministratorName: "Ana Responsável",
};
test("operador com MFA provisiona escola gratuita com responsável explícito e sem vínculo automático", async () => {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email: "operator@example.test", password: "12345678" })
    .expect(204);
  await agent
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send(school)
    .expect(403);
  const enrollment = await agent
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(200);
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(enrollment.body.totpURI) })
    .expect(204);
  await agent
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send({ ...school, initialAdministratorName: "" })
    .expect(400);
  const created = await agent
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send(school)
    .expect(201);
  expect(created.body).toEqual({
    id: expect.any(String),
    name: school.name,
    timeZone: school.timeZone,
    academicYear: 2026,
    supportTeamLabel: school.supportTeamLabel,
    studentLabel: "Estudante",
    classLabel: "Turma",
    initialAdministrator: {
      name: "Ana Responsável",
      email: "ana@example.test",
    },
    pilotStatus: "SYNTHETIC_ONLY",
    version: 1,
  });
  await agent.get(`/api/v1/schools/${created.body.id}/settings`).expect(404);
  const second = await agent
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send({
      ...school,
      name: "Escola Rio — sintética",
      timeZone: "America/Manaus",
      academicYear: 2027,
      initialAdministratorEmail: "bia@example.test",
      initialAdministratorName: "Bia Responsável",
    })
    .expect(201);
  const list = await agent.get("/api/v1/administration/schools").expect(200);
  expect(list.body.schools).toHaveLength(2);
  expect(
    (await agent.get("/api/v1/identity/school-access").expect(200)).body,
  ).toEqual({ canProvisionSchools: true, schools: [] });
  for (const input of [
    { ...school, role: "SCHOOL_ADMIN" },
    { ...school, timeZone: "invalid" },
    { ...school, academicYear: 0 },
  ])
    await agent
      .post("/api/v1/administration/schools")
      .set("Origin", origin)
      .send(input)
      .expect(400);
  await agent
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send({ ...school, initialAdministratorEmail: "missing@example.test" })
    .expect(409);
  await agent
    .post("/api/v1/administration/schools")
    .set("Origin", "https://attacker.example")
    .send(school)
    .expect(403);
  await agent.post("/api/v1/administration/schools").send(school).expect(403);
  const ana = request.agent(app.getHttpServer());
  await ana
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email: "ana@example.test", password: "12345678" })
    .expect(204);
  const setup = await ana
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(200);
  await ana
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(setup.body.totpURI) })
    .expect(204);
  expect(
    (await ana.get("/api/v1/identity/session").expect(200)).body.name,
  ).toBe("Ana Teste");
  const firstPath = `/api/v1/schools/${created.body.id}/settings`;
  const secondPath = `/api/v1/schools/${second.body.id}/settings`;
  expect((await ana.get(firstPath).expect(200)).body).toEqual(created.body);
  await ana.get(secondPath).expect(404);
  await ana.get("/api/v1/administration/schools").expect(403);
  await ana
    .post("/api/v1/administration/schools")
    .set("Origin", origin)
    .send(school)
    .expect(403);
  const settings = {
    name: school.name,
    timeZone: school.timeZone,
    academicYear: school.academicYear,
    supportTeamLabel: school.supportTeamLabel,
    studentLabel: school.studentLabel,
    classLabel: school.classLabel,
  };
  const update = {
    ...settings,
    name: "Horizonte atualizado",
    academicYear: 2028,
    version: 1,
  };
  await ana.patch(secondPath).set("Origin", origin).send(update).expect(404);
  const updated = await ana
    .patch(firstPath)
    .set("Origin", origin)
    .send(update)
    .expect(200);
  expect(updated.body).toMatchObject({
    name: "Horizonte atualizado",
    academicYear: 2028,
    version: 2,
  });
  await ana.patch(firstPath).set("Origin", origin).send(update).expect(409);
  expect((await ana.get(firstPath).expect(200)).body).toEqual(updated.body);
  const competing = await Promise.all(
    ["Primeira edição", "Segunda edição"].map((name) =>
      ana
        .patch(firstPath)
        .set("Origin", origin)
        .send({ ...update, name, version: 2 }),
    ),
  );
  expect(competing.map((result) => result.status).sort()).toEqual([200, 409]);
  const winner = competing.find((result) => result.status === 200);
  expect((await ana.get(firstPath).expect(200)).body).toEqual(winner.body);
  expect(winner.body.version).toBe(3);
  const bia = request.agent(app.getHttpServer());
  await bia
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email: "bia@example.test", password: "12345678" })
    .expect(204);
  const biaSetup = await bia
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: "12345678" })
    .expect(200);
  await bia
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(biaSetup.body.totpURI) })
    .expect(204);
  expect((await bia.get(secondPath).expect(200)).body).toEqual(second.body);
  await bia.get(firstPath).expect(404);
  await bia
    .patch(firstPath)
    .set("Origin", origin)
    .send({ ...update, version: 2 })
    .expect(404);
  // Audit has no public read endpoint yet; inspect only persisted technical events.
  const audit = new pg.Client({ connectionString: database.url });
  try {
    await audit.connect();
    const events = await audit.query(
      'SELECT action, "organizationId", details FROM school_audit ORDER BY "occurredAt", id',
    );
    expect(events.rows.map((row) => row.action)).toEqual([
      "SCHOOL_PROVISIONED",
      "SCHOOL_PROVISIONED",
      "SCHOOL_SETTINGS_UPDATED",
      "SCHOOL_SETTINGS_UPDATED",
    ]);
    expect(events.rows[0].details).toEqual(created.body);
    expect(events.rows[2].details).toEqual(updated.body);
    expect(events.rows[3].details).toEqual(winner.body);
    // Force the audit write to fail. The public list must show no partial school.
    await audit.query(`CREATE FUNCTION reject_school_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic audit unavailable'; END $$;
      CREATE TRIGGER reject_school_audit BEFORE INSERT ON school_audit FOR EACH ROW EXECUTE FUNCTION reject_school_audit();`);
    try {
      await agent
        .post("/api/v1/administration/schools")
        .set("Origin", origin)
        .send({ ...school, name: "Não deve persistir" })
        .expect(500);
      const afterFailure = await agent
        .get("/api/v1/administration/schools")
        .expect(200);
      expect(afterFailure.body.schools).toHaveLength(2);
      expect(afterFailure.body.schools.map((item) => item.name)).not.toContain(
        "Não deve persistir",
      );
    } finally {
      await audit.query(
        "DROP TRIGGER reject_school_audit ON school_audit; DROP FUNCTION reject_school_audit();",
      );
    }
    await audit.query(
      'UPDATE school_membership SET active = false WHERE "organizationId" = $1',
      [created.body.id],
    );
    await ana.get(firstPath).expect(404);
    await ana
      .patch(firstPath)
      .set("Origin", origin)
      .send({ ...update, version: 2 })
      .expect(404);
    await audit.query("UPDATE saas_operator SET enabled = false");
    await agent
      .post("/api/v1/administration/schools")
      .set("Origin", origin)
      .send(school)
      .expect(403);
  } finally {
    await audit.end();
  }
});
