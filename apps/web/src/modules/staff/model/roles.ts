import type { StaffRole } from "@soe/contracts";

export const staffRoleOptions: readonly { value: StaffRole; label: string }[] =
  [
    { value: "EDUCATIONAL_GUIDANCE", label: "Orientação educacional" },
    { value: "COORDINATION", label: "Coordenação" },
    { value: "DIRECTION", label: "Direção" },
    { value: "TUTOR", label: "Tutoria" },
    { value: "TEACHER", label: "Professor" },
    { value: "MONITOR", label: "Monitor" },
    { value: "SCHOOL_ADMIN", label: "Administração escolar" },
  ];

export function roleLabel(role: StaffRole) {
  return (
    staffRoleOptions.find((option) => option.value === role)?.label ?? role
  );
}
