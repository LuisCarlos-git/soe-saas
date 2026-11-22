import type { ManagedSchoolsQuery } from "../domain/school";
import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";

export class ListManagedSchools {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(actorId: string, query: ManagedSchoolsQuery) {
    return this.unit.listForAdministrator(actorId, query);
  }
}
