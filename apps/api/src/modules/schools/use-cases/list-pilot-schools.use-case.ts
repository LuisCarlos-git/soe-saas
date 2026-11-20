import type { SchoolUnitOfWork } from "../repositories/school-unit-of-work";
export class ListPilotSchools {
  constructor(private readonly unit: SchoolUnitOfWork) {}
  execute(actorId: string, offset: number) {
    return this.unit.listForOperator(actorId, offset);
  }
}
