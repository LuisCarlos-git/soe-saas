import type { School, SchoolSettings } from "../domain/school";
export interface SchoolTransaction {
  isOperator(actorId: string): Promise<boolean>;
  findAdministrator(email: string): Promise<{ id: string } | null>;
  create(
    settings: SchoolSettings,
    administratorId: string,
    administratorName: string,
  ): Promise<School>;
  findForAdministrator(
    organizationId: string,
    actorId: string,
  ): Promise<School | null>;
  updateForAdministrator(
    organizationId: string,
    actorId: string,
    settings: SchoolSettings,
    version: number,
  ): Promise<School | null>;
  audit(
    organizationId: string,
    actorId: string,
    action: string,
    details: School,
  ): Promise<void>;
}
export interface SchoolUnitOfWork {
  transaction<T>(
    work: (transaction: SchoolTransaction) => Promise<T>,
  ): Promise<T>;
  access(actorId: string): Promise<{
    canProvisionSchools: boolean;
    schools: { id: string; name: string }[];
  }>;
  listForOperator(
    actorId: string,
    offset: number,
  ): Promise<{ schools: School[]; hasMore: boolean }>;
}
