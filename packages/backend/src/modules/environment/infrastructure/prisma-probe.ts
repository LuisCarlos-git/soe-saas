import type { Database } from "@soe/database";
import type { EnvironmentProbe } from "../application/read-environment.js";

export class PrismaEnvironmentProbe implements EnvironmentProbe {
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
