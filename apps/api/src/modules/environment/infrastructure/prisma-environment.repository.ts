import type { Database } from "../../../infrastructure/database/database.factory";
import type { EnvironmentRepository } from "../repositories/environment.repository";

export class PrismaEnvironmentRepository implements EnvironmentRepository {
  constructor(private readonly database: Database) {}

  async read() {
    const row = await this.database.environmentProbe.findUniqueOrThrow({
      where: { id: "bootstrap" },
    });
    return row.sample;
  }

  async ready() {
    try {
      await this.read();
      return true;
    } catch {
      return false;
    }
  }
}
