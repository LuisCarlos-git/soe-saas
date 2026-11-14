import {
  EnvironmentUnavailable,
  type Environment,
} from "../domain/environment";
import type { EnvironmentRepository } from "../repositories/environment.repository";
export class ReadEnvironment {
  constructor(private readonly repository: EnvironmentRepository) {}
  async execute(): Promise<Environment> {
    try {
      return { status: "ok", sample: await this.repository.read() };
    } catch {
      throw new EnvironmentUnavailable("Synthetic environment unavailable");
    }
  }
}
