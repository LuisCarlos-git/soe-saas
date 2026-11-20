import { SchoolNotFound } from "../domain/school";
import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";
export class ReadSchoolSettings {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(actorId: string, organizationId: string) {
    return this.unit.transaction(async (tx) => {
      const school = await tx.findForAdministrator(organizationId, actorId);
      if (!school) throw new SchoolNotFound();
      return school;
    });
  }
}
