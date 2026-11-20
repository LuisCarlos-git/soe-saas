import { describe, expect, it } from "vitest";
import { schoolSettingsFormSchema } from "./school-validation";

const settings = {
  name: "Escola sintética",
  timeZone: "America/Sao_Paulo",
  academicYear: 2026,
  supportTeamLabel: "Orientação",
  studentLabel: "Estudante",
  classLabel: "Turma",
  initialAdministratorEmail: "responsavel@example.test",
};

describe("edição de configurações de escolas existentes", () => {
  it.each(["A", "a".repeat(161)])(
    "preserva nome legado do responsável sem bloquear campos editáveis (%#)",
    (initialAdministratorName) => {
      expect(
        schoolSettingsFormSchema.safeParse({
          ...settings,
          initialAdministratorName,
        }).success,
      ).toBe(true);
    },
  );
  it("continua exigindo ano e nome válidos da escola", () => {
    const result = schoolSettingsFormSchema.safeParse({
      ...settings,
      name: "",
      academicYear: 0,
      initialAdministratorName: "A",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
        "name",
        "academicYear",
      ]);
  });
});
