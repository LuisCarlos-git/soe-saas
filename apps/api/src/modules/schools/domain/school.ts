export type SchoolSettings = {
  name: string;
  timeZone: string;
  academicYear: number;
  supportTeamLabel: string;
  studentLabel: string;
  classLabel: string;
};
export type School = SchoolSettings & {
  id: string;
  version: number;
  pilotStatus: "SYNTHETIC_ONLY";
  initialAdministrator: { name: string; email: string };
};
export class SchoolForbidden extends Error {}
export class SchoolNotFound extends Error {}
export class SchoolConflict extends Error {}
