import { z } from "zod";
export const staffRoleSchema = z.enum([
  "SCHOOL_ADMIN",
  "DIRECTION",
  "COORDINATION",
  "EDUCATIONAL_GUIDANCE",
  "TUTOR",
  "TEACHER",
  "MONITOR",
]);
export const staffRolesSchema = z
  .array(staffRoleSchema)
  .min(1, "Escolha pelo menos um papel.")
  .max(7)
  .refine(
    (roles) => new Set(roles).size === roles.length,
    "Escolha cada papel apenas uma vez.",
  );
export const inviteProfessionalSchema = z.strictObject({
  name: z.string().trim().min(1, "Informe o nome do profissional.").max(160),
  email: z
    .email("Informe um e-mail válido.")
    .max(254)
    .transform((value) => value.toLowerCase()),
  roles: staffRolesSchema,
});
export const invitationSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  roles: staffRolesSchema,
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]),
  deliveryStatus: z.enum(["QUEUED", "SENT", "FAILED"]),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  sentAt: z.iso.datetime().nullable(),
  acceptedAt: z.iso.datetime().nullable(),
});
export const invitationListSchema = z.strictObject({
  invitations: z.array(invitationSchema),
  hasMore: z.boolean(),
});
export type StaffRole = z.infer<typeof staffRoleSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export const invitationTokenSchema = z.strictObject({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
export const registerInvitedIdentitySchema = invitationTokenSchema.extend({
  name: z.string().trim().min(1, "Informe seu nome.").max(160),
  password: z.string().min(8, "Use pelo menos 8 caracteres.").max(128),
});
export const invitationPreviewSchema = z.strictObject({
  name: z.string(),
  email: z.email(),
  schoolName: z.string(),
  timeZone: z.string(),
  roles: staffRolesSchema,
  expiresAt: z.iso.datetime(),
  registrationRequired: z.boolean(),
});
export const membershipsSchema = z.strictObject({
  memberships: z.array(
    z.strictObject({
      organizationId: z.uuid(),
      name: z.string(),
      roles: staffRolesSchema,
    }),
  ),
});
