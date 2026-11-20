import { z } from "zod";
import { schoolSettingsSchema } from "@soe/contracts";

// Existing identity metadata is retained, without applying creation-only name limits.
export const schoolSettingsFormSchema = schoolSettingsSchema.extend({
  initialAdministratorName: z.string(),
  initialAdministratorEmail: z.string(),
});
