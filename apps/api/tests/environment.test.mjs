import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import request from "supertest";
import { startTestPostgres } from "@soe/test-utils";

describe("percurso público com PostgreSQL real", () => {
  let database;
  let app;
  let openApi;
  const logs = [];
  beforeAll(async () => {
    database = await startTestPostgres();
    const { createApi, createOpenApi } = await import("../dist/app.js");
    openApi = createOpenApi;
    app = await createApi(
      {
        NODE_ENV: "test",
        DATABASE_URL: database.url,
        API_HOST: "127.0.0.1",
        API_PORT: "3001",
        LOG_LEVEL: "info",
      },
      {
        write: (chunk) => {
          logs.push(String(chunk));
        },
      },
    );
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
    await database?.stop();
  });
  test("a consulta sintética atravessa contrato, HTTP e migração real", async () => {
    const result = await request(app.getHttpServer()).get(
      "/api/v1/environment",
    );
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      status: "ok",
      sample: "SOE: ambiente de desenvolvimento validado.",
    });
    expect(result.headers["cache-control"]).toBe("no-store");
  });
  test("OpenAPI descreve o health mínimo e os envelopes HTTP realmente entregues", () => {
    const document = openApi(app);
    expect(
      document.paths["/api/v1/environment"].get.responses["200"],
    ).toBeDefined();
    expect(
      document.paths["/api/v1/environment"].get.responses["400"],
    ).toBeDefined();
    expect(document.paths["/health/ready"].get.responses["503"]).toBeDefined();
    expect(
      Object.keys(document.components.schemas.HealthResponse_Output.properties),
    ).toEqual(["status"]);
    expect(JSON.stringify(document)).not.toMatch(
      /responseTime|DATABASE_URL|password/,
    );
  });
  test("entrada inválida retorna envelope seguro e logs não capturam segredos", async () => {
    const result = await request(app.getHttpServer())
      .get("/api/v1/environment?probe=PRIVATE_STUDENT&q=PRIVATE_REPORT")
      .set("Authorization", "Bearer PRIVATE_TOKEN")
      .set("Cookie", "session=PRIVATE_COOKIE")
      .set("x-correlation-id", "PRIVATE_CORRELATION");
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      code: "INVALID_INPUT",
      message: "Parâmetros inválidos.",
    });
    expect(result.body.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.stringify(result.body)).not.toContain("PRIVATE_");
    const lines = logs
      .join("")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(
      lines.some((line) => line.correlationId === result.body.correlationId),
    ).toBe(true);
    expect(logs.join("")).not.toContain("PRIVATE_");
  });
  test("liveness continua disponível e readiness falha com timeout curto quando PostgreSQL para", async () => {
    database.pause();
    try {
      const started = Date.now();
      const live = await request(app.getHttpServer()).get("/health/live");
      expect(live.status).toBe(200);
      expect(live.body).toEqual({ status: "ok" });
      const ready = await request(app.getHttpServer()).get("/health/ready");
      expect(ready.status).toBe(503);
      expect(ready.body).toMatchObject({
        code: "UNAVAILABLE",
        message: "Ambiente temporariamente indisponível.",
      });
      expect(JSON.stringify(ready.body)).not.toMatch(
        /postgres|password|stack|127\.0\.0\.1/i,
      );
      expect(Date.now() - started).toBeLessThan(5000);
    } finally {
      database.unpause();
    }
    const recovered = await request(app.getHttpServer()).get("/health/ready");
    expect(recovered.status).toBe(200);
    expect(recovered.body).toEqual({ status: "ok" });
  });
});
