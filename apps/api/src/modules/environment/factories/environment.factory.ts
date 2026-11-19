import type { Database } from "../../../infrastructure/database/database.factory";
import { PrismaEnvironmentRepository } from "../infrastructure/prisma-environment.repository";
import { ReadEnvironment } from "../use-cases/read-environment.use-case";
import { CheckReadiness } from "../use-cases/check-readiness.use-case";
export function createEnvironmentUseCases(database: Database) {
  const repository = new PrismaEnvironmentRepository(database);
  return {
    read: new ReadEnvironment(repository),
    readiness: new CheckReadiness(repository),
  };
}
