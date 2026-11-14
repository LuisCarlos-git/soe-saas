import type { SessionRepository } from "../repositories/session.repository";
export class CurrentIdentity {
  constructor(private readonly sessions: SessionRepository) {}
  execute(credential: string) {
    return this.sessions.findByCredential(credential);
  }
}
