import type { StaffUnitOfWork } from "../repositories/staff-unit-of-work";
import { StaffNotFound } from "../domain/staff";
export class ListInvitations {
  constructor(private readonly unit: StaffUnitOfWork) {}
  execute(actorId: string, organizationId: string, offset: number) {
    return this.unit.transaction(organizationId, actorId, async (tx) => {
      if (!(await tx.isAdministrator())) throw new StaffNotFound();
      return tx.listInvitations(offset);
    });
  }
}
