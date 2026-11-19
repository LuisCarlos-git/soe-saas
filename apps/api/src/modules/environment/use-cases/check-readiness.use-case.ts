import type { EnvironmentRepository } from "../repositories/environment.repository";
export class CheckReadiness {
  constructor(private readonly repository: EnvironmentRepository) {}
  execute() {
    return this.repository.ready();
  }
}
