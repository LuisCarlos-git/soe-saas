import type { SessionReader } from "../ports/session-reader.js";
export class CurrentIdentity {
  constructor(private readonly sessions: SessionReader) {}
  execute(credential: string) {
    return this.sessions.read(credential);
  }
}
