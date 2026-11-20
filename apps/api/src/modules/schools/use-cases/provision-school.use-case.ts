import {
  SchoolConflict,
  SchoolForbidden,
  type SchoolSettings,
} from "../domain/school";
import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";
export class ProvisionSchool {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(
    actorId: string,
    settings: SchoolSettings,
    administratorEmail: string,
    administratorName: string,
  ) {
    return this.unit.transaction(async (tx) => {
      if (!(await tx.isOperator(actorId))) throw new SchoolForbidden();
      const administrator = await tx.findAdministrator(administratorEmail);
      if (!administrator) throw new SchoolConflict();
      const school = await tx.create(
        settings,
        administrator.id,
        administratorName,
      );
      await tx.audit(school.id, actorId, "SCHOOL_PROVISIONED", school);
      return school;
    });
  }
}
