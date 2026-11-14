import { createZodDto } from "nestjs-zod";
import { errorSchema, healthSchema } from "@soe/contracts";

export class SafeErrorResponse extends createZodDto(errorSchema) {}
export class HealthResponse extends createZodDto(healthSchema) {}
