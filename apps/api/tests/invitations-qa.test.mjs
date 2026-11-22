import { beforeAll, afterAll, test, expect } from "@jest/globals";
import request from "supertest";
import pg from "pg";
import {
  errorSchema,
  invitationSchema,
  invitationListSchema,
  membershipsSchema,
} from "@soe/contracts";
import { startTestPostgres } from "./support/postgres.mjs";
import { startTestMailpit } from "./support/mailpit.mjs";
import { migrateTestDatabase } from "../../../scripts/migrate-test-database.mjs";
import { totp } from "../../../scripts/test-totp.mjs";

let database, mailbox, app, db, ana, bia, schoolA, schoolB, openApi;
const origin = "http://127.0.0.1:43120";
const password = "qa-synthetic-password";
const logs = [];

async function enableMfa(agent, credential) {
  const setup = await agent
    .post("/api/auth/two-factor/enable")
    .set("Origin", origin)
    .send({ password: credential })
    .expect(200);
  await agent
    .post("/api/auth/two-factor/verify-totp")
    .set("Origin", origin)
    .send({ code: totp(setup.body.totpURI) })
    .expect(204);
}
async function administrator(email) {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email, password: "12345678" })
    .expect(204);
  await enableMfa(agent, "12345678");
  return agent;
}
async function poll(check) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Synthetic QA condition did not become ready");
}
async function invitation(
  email,
  roles = ["TEACHER"],
  school = schoolA,
  actor = ana,
) {
  const previousMessages = await (
    await fetch(`${mailbox.baseUrl}/api/v1/messages`)
  ).json();
  const previousIds = new Set(
    previousMessages.messages.map((message) => message.ID),
  );
  const response = await actor
    .post(`/api/v1/schools/${school.id}/invitations`)
    .set("Origin", origin)
    .send({ name: "Profissional QA", email, roles })
    .expect(201);
  expect(invitationSchema.safeParse(response.body).success).toBe(true);
  const mail = await poll(async () => {
    const data = await (
      await fetch(`${mailbox.baseUrl}/api/v1/messages`)
    ).json();
    return data.messages.find(
      (message) =>
        !previousIds.has(message.ID) &&
        message.Subject === `Convite para ${school.name}` &&
        message.To.some((recipient) => recipient.Address === email),
    );
  });
  const message = await (
    await fetch(`${mailbox.baseUrl}/api/v1/message/${mail.ID}`)
  ).json();
  const link = message.Text.match(
    /https?:\/\/[^\s]+\/invitations\/accept#[A-Za-z0-9_-]+/,
  )?.[0];
  if (!link)
    throw new Error("Synthetic invitation message missing acceptance link");
  await poll(
    async () =>
      (
        await db.query(
          'SELECT "deliveryStatus" FROM school_invitation WHERE id=$1',
          [response.body.id],
        )
      ).rows[0]?.deliveryStatus === "SENT",
  );
  return { ...response.body, token: new URL(link).hash.slice(1) };
}
async function invitedIdentity(invite, email) {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post("/api/v1/invitations/register")
    .set("Origin", origin)
    .send({ token: invite.token, name: "Pessoa QA", password })
    .expect(204);
  await agent
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email, password })
    .expect(204);
  return agent;
}
function accept(agent, token) {
  return agent
    .post("/api/v1/invitations/accept")
    .set("Origin", origin)
    .send({ token });
}
async function effects(invite, email) {
  const result = await db.query(
    `SELECT
    (SELECT count(*)::int FROM school_membership m JOIN "user" u ON u.id=m."userId" WHERE m."organizationId"=$1 AND u.email=$2) AS memberships,
    (SELECT count(*)::int FROM school_audit WHERE "organizationId"=$1 AND action='STAFF_INVITATION_ACCEPTED' AND details->>'invitationId'=$3) AS audits,
    (SELECT "acceptedAt" IS NOT NULL FROM school_invitation WHERE "organizationId"=$1 AND id=$3) AS consumed`,
    [invite.organizationId ?? schoolA.id, email, invite.id],
  );
  return result.rows[0];
}

beforeAll(async () => {
  [database, mailbox] = await Promise.all([
    startTestPostgres(),
    startTestMailpit(),
  ]);
  migrateTestDatabase(database.url);
  const { createApi, createOpenApi } = await import("../dist/app.js");
  app = await createApi(
    {
      NODE_ENV: "test",
      DATABASE_URL: database.url,
      AUTH_RATE_MAX: 100,
      INVITATION_RATE_MAX: 500,
      INVITATION_MAIL_MODE: "development-smtp",
      INVITATION_SMTP_HOST: mailbox.host,
      INVITATION_SMTP_PORT: mailbox.smtpPort,
    },
    { write: (value) => logs.push(String(value)) },
  );
  await app.init();
  openApi = createOpenApi(app);
  const { provisionTestIdentities } =
    await import("../dist/cli/synthetic-identities.js");
  await provisionTestIdentities(database.url, "test");
  db = new pg.Client({ connectionString: database.url });
  await db.connect();
  const operator = await administrator("operator@example.test");
  const createSchool = async (name, email) =>
    (
      await operator
        .post("/api/v1/administration/schools")
        .set("Origin", origin)
        .send({
          name,
          timeZone: "America/Sao_Paulo",
          academicYear: 2026,
          supportTeamLabel: "Orientação",
          studentLabel: "Estudante",
          classLabel: "Turma",
          initialAdministratorName: "Responsável QA",
          initialAdministratorEmail: email,
        })
        .expect(201)
    ).body;
  schoolA = await createSchool("Escola QA A", "ana@example.test");
  schoolB = await createSchool("Escola QA B", "bia@example.test");
  ana = await administrator("ana@example.test");
  bia = await administrator("bia@example.test");
});
afterAll(async () => {
  await db?.end();
  await app?.close();
  await Promise.all([database?.stop(), mailbox?.stop()]);
});

test("QA-006-08-O: OpenAPI documenta os erros observados nos fluxos de convite", () => {
  for (const [path, method, statuses] of [
    [
      "/api/v1/schools/{organizationId}/invitations",
      "post",
      [400, 401, 403, 404, 409],
    ],
    ["/api/v1/schools/{organizationId}/invitations", "get", [401, 403, 404]],
    ["/api/v1/invitations/preview", "post", [400, 403, 410, 429]],
    ["/api/v1/invitations/register", "post", [400, 403, 409, 410, 429]],
    ["/api/v1/invitations/accept", "post", [400, 401, 403, 409, 410, 429, 500]],
  ]) {
    expect(Object.keys(openApi.paths[path][method].responses)).toEqual(
      expect.arrayContaining(statuses.map(String)),
    );
  }
});

test("QA-006-03-C: aceite simultâneo produz um vínculo e uma auditoria", async () => {
  const email = "concurrent@example.test";
  const invite = await invitation(email);
  const person = await invitedIdentity(invite, email);
  const results = await Promise.all([
    accept(person, invite.token),
    accept(person, invite.token),
  ]);
  expect(results.map((result) => result.status).sort()).toEqual([204, 410]);
  expect(await effects(invite, email)).toEqual({
    memberships: 1,
    audits: 1,
    consumed: true,
  });
  expect(logs.join("").includes(invite.token)).toBe(false);
});

test("QA-006-03-E: convite expirado não cria vínculo nem auditoria de aceite", async () => {
  const email = "expired@example.test";
  const invite = await invitation(email);
  const person = await invitedIdentity(invite, email);
  // Fixture temporal no PostgreSQL descartável; o comportamento é testado pelo HTTP.
  await db.query(
    'UPDATE school_invitation SET "createdAt"=now()-interval \'2 hours\', "expiresAt"=now()-interval \'1 hour\' WHERE "organizationId"=$1 AND id=$2',
    [schoolA.id, invite.id],
  );
  const preview = await person
    .post("/api/v1/invitations/preview")
    .set("Origin", origin)
    .send({ token: invite.token })
    .expect(410);
  const response = await accept(person, invite.token).expect(410);
  expect(errorSchema.safeParse(preview.body).success).toBe(true);
  expect(response.body.code).toBe("INVITATION_INVALID");
  expect(await effects(invite, email)).toEqual({
    memberships: 0,
    audits: 0,
    consumed: false,
  });
});

test("QA-006-03-N: novo convite substitui expirado sem revalidar o link anterior", async () => {
  const email = "replace-expired@example.test";
  const old = await invitation(email);
  await db.query(
    'UPDATE school_invitation SET "createdAt"=now()-interval \'2 hours\', "expiresAt"=now()-interval \'1 hour\' WHERE "organizationId"=$1 AND id=$2',
    [schoolA.id, old.id],
  );
  const current = await invitation(email);
  const preview = (token) =>
    request(app.getHttpServer())
      .post("/api/v1/invitations/preview")
      .set("Origin", origin)
      .send({ token });
  await preview(old.token).expect(410);
  await preview(current.token).expect(200);
  const rows = (
    await db.query(
      'SELECT id, "revokedAt", "tokenCiphertext" FROM school_invitation WHERE "organizationId"=$1 AND email=$2',
      [schoolA.id, email],
    )
  ).rows;
  expect(rows).toHaveLength(2);
  expect(Boolean(rows.find((row) => row.id === old.id)?.revokedAt)).toBe(true);
  expect(rows.find((row) => row.id === old.id)?.tokenCiphertext).toBeNull();
  expect(
    (
      await db.query(
        "SELECT count(*)::int AS count FROM school_audit WHERE \"organizationId\"=$1 AND action='INVITATION_EXPIRED_REPLACED' AND details->>'invitationId'=$2",
        [schoolA.id, old.id],
      )
    ).rows[0].count,
  ).toBe(1);
});

test("QA-006-03-I: conta diferente não consome convite de outra pessoa", async () => {
  const email = "identity-match@example.test";
  const invite = await invitation(email);
  await accept(ana, invite.token).expect(403);
  expect(await effects(invite, email)).toEqual({
    memberships: 0,
    audits: 0,
    consumed: false,
  });
  const person = await invitedIdentity(invite, email);
  await accept(person, invite.token).expect(204);
  expect(await effects(invite, email)).toEqual({
    memberships: 1,
    audits: 1,
    consumed: true,
  });
});

test("QA-006-03-MFA: aceitar administração exige MFA e não consome antes da verificação", async () => {
  const email = "administrative-mfa@example.test";
  const invite = await invitation(email, ["SCHOOL_ADMIN"]);
  const person = await invitedIdentity(invite, email);
  const blocked = await accept(person, invite.token).expect(403);
  expect(blocked.body.code).toBe("MFA_REQUIRED");
  expect(await effects(invite, email)).toEqual({
    memberships: 0,
    audits: 0,
    consumed: false,
  });
  await enableMfa(person, password);
  await accept(person, invite.token).expect(204);
  await person.get(`/api/v1/schools/${schoolA.id}/invitations`).expect(200);
  expect(await effects(invite, email)).toEqual({
    memberships: 1,
    audits: 1,
    consumed: true,
  });
});

test("QA-006-03-R: registrar novamente não sobrescreve a credencial da identidade existente", async () => {
  const email = "existing-identity@example.test";
  const invite = await invitation(email);
  const person = await invitedIdentity(invite, email);
  await request(app.getHttpServer())
    .post("/api/v1/invitations/register")
    .set("Origin", origin)
    .send({
      token: invite.token,
      name: "Nome substituído",
      password: "different-synthetic-password",
    })
    .expect(409);
  const confirmation = request.agent(app.getHttpServer());
  await confirmation
    .post("/api/auth/sign-in/email")
    .set("Origin", origin)
    .send({ email, password })
    .expect(204);
  const identity = await confirmation
    .get("/api/v1/identity/session")
    .expect(200);
  expect(identity.body.name).toBe("Pessoa QA");
  await accept(person, invite.token).expect(204);
});

test("QA-006-04-M: identidade tem papéis independentes em duas escolas", async () => {
  const email = "two-schools@example.test";
  const first = await invitation(email);
  const person = await invitedIdentity(first, email);
  await accept(person, first.token).expect(204);
  const second = await invitation(email, ["DIRECTION"], schoolB, bia);
  const preview = await person
    .post("/api/v1/invitations/preview")
    .set("Origin", origin)
    .send({ token: second.token })
    .expect(200);
  expect(preview.body.registrationRequired).toBe(false);
  await accept(person, second.token).expect(204);
  const list = await person.get("/api/v1/identity/memberships").expect(200);
  expect(membershipsSchema.safeParse(list.body).success).toBe(true);
  expect(list.body.memberships).toEqual([
    { organizationId: schoolA.id, name: schoolA.name, roles: ["TEACHER"] },
    { organizationId: schoolB.id, name: schoolB.name, roles: ["DIRECTION"] },
  ]);
  // MFA verificada distingue recusa por papel de um bloqueio por MFA ausente.
  await enableMfa(person, password);
  for (const school of [schoolA, schoolB]) {
    await person.get(`/api/v1/schools/${school.id}/invitations`).expect(404);
    await person
      .post(`/api/v1/schools/${school.id}/invitations`)
      .set("Origin", origin)
      .send({
        name: "Sem autoridade",
        email: "unauthorized@example.test",
        roles: ["SCHOOL_ADMIN"],
      })
      .expect(404);
  }
  expect(
    (
      await db.query(
        "SELECT count(*)::int AS count FROM school_invitation WHERE email=$1",
        ["unauthorized@example.test"],
      )
    ).rows[0].count,
  ).toBe(0);
});

test("QA-006-04-A: admin de uma escola não lista ou cria convites em outra", async () => {
  await ana.get(`/api/v1/schools/${schoolB.id}/invitations`).expect(404);
  await ana
    .post(`/api/v1/schools/${schoolB.id}/invitations`)
    .set("Origin", origin)
    .send({
      name: "Outro escopo",
      email: "cross-school@example.test",
      roles: ["TEACHER"],
    })
    .expect(404);
  expect(
    (
      await db.query(
        "SELECT count(*)::int AS count FROM school_invitation WHERE email=$1",
        ["cross-school@example.test"],
      )
    ).rows[0].count,
  ).toBe(0);
});

test("QA-006-06-D: duplo envio concorrente mantém um único convite", async () => {
  const email = "double-submit@example.test";
  const post = () =>
    ana
      .post(`/api/v1/schools/${schoolA.id}/invitations`)
      .set("Origin", origin)
      .send({ name: "Duplo envio", email, roles: ["TEACHER"] });
  const results = await Promise.all([post(), post()]);
  expect(results.map((response) => response.status).sort()).toEqual([201, 409]);
  expect(
    (
      await db.query(
        'SELECT count(*)::int AS count FROM school_invitation WHERE "organizationId"=$1 AND email=$2',
        [schoolA.id, email],
      )
    ).rows[0].count,
  ).toBe(1);
  expect(
    (
      await db.query(
        "SELECT count(*)::int AS count FROM school_audit WHERE \"organizationId\"=$1 AND action='INVITATION_CREATED' AND details->>'email'=$2",
        [schoolA.id, email],
      )
    ).rows[0].count,
  ).toBe(1);
});

test("QA-006-06-V: papéis inválidos, campos extras e origem externa não alteram dados", async () => {
  const input = {
    name: "Validação",
    email: "validation@example.test",
    roles: ["TEACHER"],
  };
  const route = `/api/v1/schools/${schoolA.id}/invitations`;
  for (const change of [
    { name: "   " },
    { roles: [] },
    { roles: ["TEACHER", "TEACHER"] },
    { roles: ["READ_RESTRICTED"] },
    { userId: "forged-actor" },
    { organizationId: schoolB.id },
  ]) {
    const response = await ana
      .post(route)
      .set("Origin", origin)
      .send({ ...input, ...change })
      .expect(400);
    expect(errorSchema.safeParse(response.body).success).toBe(true);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.stringify(response.body)).not.toMatch(
      /Prisma|stack|tokenHash|tokenCiphertext/,
    );
  }
  await ana
    .post(route)
    .set("Origin", "https://external.example.test")
    .send(input)
    .expect(403);
  await ana.post(route).send(input).expect(403);
  await request(app.getHttpServer())
    .post(route)
    .set("Origin", origin)
    .send(input)
    .expect(401);
  expect(
    (
      await db.query(
        "SELECT count(*)::int AS count FROM school_invitation WHERE email=$1",
        [input.email],
      )
    ).rows[0].count,
  ).toBe(0);
});

test("QA-006-07-T: falha de auditoria reverte consumo e vínculo; retry recupera", async () => {
  const email = "rollback@example.test";
  const invite = await invitation(email);
  const person = await invitedIdentity(invite, email);
  await db.query(`CREATE FUNCTION qa_reject_invitation_accept() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='STAFF_INVITATION_ACCEPTED' THEN RAISE EXCEPTION 'synthetic audit unavailable'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER qa_reject_invitation_accept BEFORE INSERT ON school_audit FOR EACH ROW EXECUTE FUNCTION qa_reject_invitation_accept();`);
  try {
    const failed = await accept(person, invite.token).expect(500);
    expect(errorSchema.safeParse(failed.body).success).toBe(true);
    expect(JSON.stringify(failed.body)).not.toMatch(
      /synthetic audit unavailable|Prisma|stack/,
    );
    expect(await effects(invite, email)).toEqual({
      memberships: 0,
      audits: 0,
      consumed: false,
    });
  } finally {
    await db.query(
      "DROP TRIGGER qa_reject_invitation_accept ON school_audit; DROP FUNCTION qa_reject_invitation_accept();",
    );
  }
  await accept(person, invite.token).expect(204);
  expect(await effects(invite, email)).toEqual({
    memberships: 1,
    audits: 1,
    consumed: true,
  });
  expect(logs.join("").includes(invite.token)).toBe(false);
});

test("QA-006-09-L: limite persiste ao reiniciar e não confia em X-Forwarded-For", async () => {
  const { createApi } = await import("../dist/app.js");
  const createLimitedApi = async () => {
    const api = await createApi(
      {
        NODE_ENV: "test",
        DATABASE_URL: database.url,
        AUTH_SECRET: "synthetic-qa-rate-limit-independent-key",
        INVITATION_RATE_MAX: 1,
      },
      { write: (value) => logs.push(String(value)) },
    );
    await api.init();
    return api;
  };
  let limited = await createLimitedApi();
  const preview = (api, ip) =>
    request(api.getHttpServer())
      .post("/api/v1/invitations/preview")
      .set("Origin", origin)
      .set("X-Forwarded-For", ip)
      .send({ token: "A".repeat(43) });
  try {
    await preview(limited, "203.0.113.1").expect(410);
    const blocked = await preview(limited, "203.0.113.2").expect(429);
    expect(blocked.body.code).toBe("TOO_MANY_REQUESTS");
    await limited.close();
    limited = null;
    limited = await createLimitedApi();
    await preview(limited, "203.0.113.3").expect(429);
  } finally {
    await limited?.close();
  }
});

test("QA-006-T01-03: busca global, ordenação estável, paginação, estados e isolamento", async () => {
  const path = `/api/v1/schools/${schoolA.id}/invitations`;
  const records = [];
  for (let index = 0; index < 23; index++) {
    const response = await ana
      .post(path)
      .set("Origin", origin)
      .send({
        name: `Tabela QA ${String(index).padStart(2, "0")}`,
        email: `tabela-qa-${index}@example.test`,
        roles: ["TEACHER"],
      })
      .expect(201);
    records.push(response.body);
  }
  const list = async (query) => {
    const response = await ana.get(path).query(query).expect(200);
    return invitationListSchema.parse(response.body);
  };
  const query = {
    search: "TABELA QA",
    limit: 10,
    sortBy: "name",
    sortDirection: "asc",
  };
  const first = await list(query);
  const second = await list({ ...query, offset: 10 });
  const last = await list({ ...query, offset: 20 });
  expect([first.total, second.total, last.total]).toEqual([23, 23, 23]);
  expect([first.hasMore, second.hasMore, last.hasMore]).toEqual([
    true,
    true,
    false,
  ]);
  const rows = [
    ...first.invitations,
    ...second.invitations,
    ...last.invitations,
  ];
  expect(rows.map((row) => row.id)).toEqual(records.map((row) => row.id));
  expect(new Set(rows.map((row) => row.id)).size).toBe(23);
  expect(
    rows.every(
      (row) => row.status === "PENDING" && row.membershipActive === null,
    ),
  ).toBe(true);
  const desc = await list({ ...query, sortDirection: "desc" });
  expect(desc.invitations[0].id).toBe(records[22].id);
  expect(
    (await list({ search: "tabela-qa-22@EXAMPLE.TEST" })).invitations.map(
      (row) => row.id,
    ),
  ).toEqual([records[22].id]);
  expect((await list({ search: "absent-table-qa" })).total).toBe(0);
  expect((await list({ search: "%" })).total).toBe(0);
  expect((await list({ search: "_" })).total).toBe(0);
  for (const invalid of [
    { limit: 51 },
    { offset: -1 },
    { sortBy: "tokenHash" },
    { status: "ACTIVE" },
    { search: "a".repeat(161) },
  ]) {
    await ana.get(path).query(invalid).expect(400);
  }
  await ana
    .get(`/api/v1/schools/${schoolB.id}/invitations`)
    .query(query)
    .expect(404);
  await bia.get(path).query(query).expect(404);
  expect(
    (
      await bia
        .get(`/api/v1/schools/${schoolB.id}/invitations`)
        .query(query)
        .expect(200)
    ).body.total,
  ).toBe(0);
  const actor = (
    await db.query('SELECT id FROM "user" WHERE email=$1', ["ana@example.test"])
  ).rows[0].id;
  await db.query(
    'UPDATE school_invitation SET "acceptedAt"=now(), "acceptedByUserId"=$2 WHERE id=$1',
    [records[0].id, actor],
  );
  await db.query(
    "UPDATE school_invitation SET \"createdAt\"=now()-interval '2 days', \"expiresAt\"=now()-interval '1 minute' WHERE id=$1",
    [records[1].id],
  );
  await db.query('UPDATE school_invitation SET "revokedAt"=now() WHERE id=$1', [
    records[2].id,
  ]);
  const accepted = await list({ ...query, status: "ACCEPTED" });
  expect(accepted.invitations).toHaveLength(1);
  expect(accepted.invitations[0].membershipActive).toBe(true);
  // Controlled deactivation fixture, read back through the public HTTP boundary.
  await db.query(
    'UPDATE school_membership SET active=false WHERE "organizationId"=$1 AND "userId"=$2',
    [schoolA.id, actor],
  );
  try {
    await ana.get(path).query(query).expect(404);
  } finally {
    await db.query(
      'UPDATE school_membership SET active=true WHERE "organizationId"=$1 AND "userId"=$2',
      [schoolA.id, actor],
    );
  }
  const inactiveUser = (
    await db.query('SELECT id FROM "user" WHERE email=$1', ["bia@example.test"])
  ).rows[0].id;
  await db.query(
    "INSERT INTO school_membership (\"organizationId\", \"userId\", role, roles, active) VALUES ($1,$2,'TEACHER',ARRAY['TEACHER'],false)",
    [schoolA.id, inactiveUser],
  );
  await db.query(
    'UPDATE school_invitation SET "acceptedByUserId"=$2 WHERE id=$1',
    [records[0].id, inactiveUser],
  );
  expect(
    (await list({ ...query, status: "ACCEPTED" })).invitations[0]
      .membershipActive,
  ).toBe(false);
  for (const [status, expected] of [
    ["EXPIRED", records[1].id],
    ["REVOKED", records[2].id],
  ]) {
    const result = await list({ ...query, status });
    expect(result.invitations.map((row) => row.id)).toEqual([expected]);
  }
  expect((await list({ ...query, status: "PENDING" })).total).toBe(20);
});
