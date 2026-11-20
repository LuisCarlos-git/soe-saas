import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";
export class FindSchoolAccess {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(actorId: string) {
    return this.unit.access(actorId);
  }
}
