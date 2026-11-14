import type { Identity } from "../domain/identity";
import type { SessionRepository } from "../repositories/session.repository";
type SessionLookup = (credential: string) => Promise<Identity | null>;
export class BetterAuthSessionRepository implements SessionRepository {
  constructor(private readonly lookup: SessionLookup) {}
  findByCredential(credential: string) {
    if (!credential) return Promise.resolve(null);
    return this.lookup(credential);
  }
}
