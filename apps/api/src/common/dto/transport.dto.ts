import { createZodDto } from "nestjs-zod";
import { errorSchema, healthSchema, loginSchema } from "@soe/contracts";

export class SafeErrorResponse extends createZodDto(errorSchema) {}
export class HealthResponse extends createZodDto(healthSchema) {}

export class LoginRequest extends createZodDto(loginSchema) {}

import {
  mfaEnrollmentSchema,
  mfaVerificationSchema,
  mfaSetupSchema,
  mfaChallengeSchema,
} from "@soe/contracts";
export class MfaEnrollmentRequest extends createZodDto(mfaEnrollmentSchema) {}
export class MfaVerificationRequest extends createZodDto(
  mfaVerificationSchema,
) {}
export class MfaSetupResponse extends createZodDto(mfaSetupSchema) {}
export class MfaChallengeResponse extends createZodDto(mfaChallengeSchema) {}
