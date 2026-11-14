import type { Identity } from "../domain/identity";
export interface SessionRepository {
  findByCredential(credential: string): Promise<Identity | null>;
}
