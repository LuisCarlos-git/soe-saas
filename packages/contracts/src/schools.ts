import { z } from "zod";

const label = z
  .string()
  .trim()
  .min(1, "Preencha este campo.")
  .max(80, "Use até 80 caracteres.");
export const schoolSettingsSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da escola.")
    .max(160, "Use até 160 caracteres."),
  timeZone: z
    .string()
    .min(1, "Escolha o fuso horário.")
    .max(80)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("pt-BR", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Escolha um fuso horário válido."),
  academicYear: z
    .number()
    .int("Informe um ano inteiro.")
    .min(2000, "Informe um ano entre 2000 e 2100.")
    .max(2100, "Informe um ano entre 2000 e 2100."),
  supportTeamLabel: label,
  studentLabel: label,
  classLabel: label,
});
export const provisionSchoolSchema = schoolSettingsSchema.extend({
  initialAdministratorName: z
    .string()
    .trim()
    .min(2, "Informe o nome do responsável.")
    .max(160, "Use até 160 caracteres."),
  initialAdministratorEmail: z
    .email("Informe um e-mail válido.")
    .max(254)
    .transform((value) => value.toLowerCase()),
});
export const updateSchoolSchema = schoolSettingsSchema.extend({
  version: z.number().int().positive(),
});
export const schoolSchema = schoolSettingsSchema.extend({
  id: z.uuid(),
  version: z.number().int().positive(),
  initialAdministrator: z.strictObject({ name: z.string(), email: z.email() }),
  pilotStatus: z.literal("SYNTHETIC_ONLY"),
});
export const schoolAccessSchema = z.strictObject({
  canProvisionSchools: z.boolean(),
  schools: z.array(z.strictObject({ id: z.uuid(), name: z.string() })),
});
export const schoolListSchema = z.strictObject({
  schools: z.array(schoolSchema),
  hasMore: z.boolean(),
});
export type SchoolSettings = z.infer<typeof schoolSettingsSchema>;
export type School = z.infer<typeof schoolSchema>;
export type SchoolAccess = z.infer<typeof schoolAccessSchema>;
export const managedSchoolSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  timeZone: z.string(),
  academicYear: z.number().int(),
  supportTeamLabel: z.string(),
  activeProfessionals: z.number().int().nonnegative(),
  pendingInvitations: z.number().int().nonnegative(),
  totalInvitations: z.number().int().nonnegative(),
});
export const managedSchoolsQuerySchema = z.strictObject({
  offset: z.coerce.number().int().min(0).max(100000).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(160).default(""),
  sortBy: z.enum(["name", "academicYear"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});
export const managedSchoolsSchema = z.strictObject({
  schools: z.array(managedSchoolSchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});
export type ManagedSchool = z.infer<typeof managedSchoolSchema>;
export type ManagedSchoolsQuery = z.infer<typeof managedSchoolsQuerySchema>;
