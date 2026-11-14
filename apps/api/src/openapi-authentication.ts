import type { OpenAPIObject } from "@nestjs/swagger";

// These routes are mounted before Nest controllers. Generate their payloads from the same contracts.
export function documentAuthentication(document: OpenAPIObject) {
  const error = {
    description: "Erro seguro",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/SafeErrorResponse" },
      },
    },
  };
  for (const path of ["sign-in/email", "sign-out"]) {
    document.paths[`/api/auth/${path}`] = {
      post: {
        operationId: path === "sign-out" ? "endSession" : "startSession",
        summary: path === "sign-out" ? "Encerrar sessão" : "Entrar",
        parameters: [
          {
            in: "header",
            name: "Origin",
            required: true,
            schema: { type: "string", format: "uri" },
          },
        ],
        ...(path === "sign-in/email"
          ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/LoginRequest" },
                  },
                },
              },
            }
          : {}),
        responses: {
          "204": { description: "Cookie HttpOnly atualizado; corpo vazio" },
          "400": error,
          "401": error,
          "403": error,
          "413": error,
          "429": {
            ...error,
            headers: {
              "Retry-After": {
                description: "Segundos até nova tentativa",
                schema: { type: "integer" },
              },
            },
          },
          "503": error,
        },
      },
    };
  }
  return document;
}
