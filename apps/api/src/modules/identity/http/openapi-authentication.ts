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
    const signingIn = path === "sign-in/email";
    const operation: NonNullable<OpenAPIObject["paths"][string]["post"]> = {
      operationId: "endSession",
      summary: "Encerrar sessão",
      parameters: [
        {
          in: "header",
          name: "Origin",
          required: true,
          schema: { type: "string", format: "uri" },
        },
      ],
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
    };
    if (signingIn) {
      document.paths[`/api/auth/${path}`] = {
        post: {
          ...operation,
          operationId: "startSession",
          summary: "Entrar",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
        },
      };
      continue;
    }
    document.paths[`/api/auth/${path}`] = { post: operation };
  }
  return document;
}
