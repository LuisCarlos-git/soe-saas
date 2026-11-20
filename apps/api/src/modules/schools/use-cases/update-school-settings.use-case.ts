import {
  SchoolConflict,
  SchoolNotFound,
  type SchoolSettings,
} from "../domain/school";
import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";
export class UpdateSchoolSettings {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(
    actorId: string,
    organizationId: string,
    settings: SchoolSettings,
    version: number,
  ) {
    return this.unit.transaction(async (tx) => {
      if (!(await tx.findForAdministrator(organizationId, actorId)))
        throw new SchoolNotFound();
      const school = await tx.updateForAdministrator(
        organizationId,
        actorId,
        settings,
        version,
      );
      if (!school) throw new SchoolConflict();
      await tx.audit(
        organizationId,
        actorId,
        "SCHOOL_SETTINGS_UPDATED",
        school,
      );
      return school;
    });
  }
}
