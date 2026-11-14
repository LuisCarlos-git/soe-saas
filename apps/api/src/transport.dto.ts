import { createZodDto } from "nestjs-zod";
import { errorSchema, healthSchema, loginSchema } from "@soe/contracts";

export class SafeErrorResponse extends createZodDto(errorSchema) {}
export class HealthResponse extends createZodDto(healthSchema) {}

export class LoginRequest extends createZodDto(loginSchema) {}
