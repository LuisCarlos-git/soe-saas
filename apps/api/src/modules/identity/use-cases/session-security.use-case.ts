import type { SessionSecurityRepository } from "../repositories/session-security.repository";
export class AuthenticationRequired extends Error {}
export class MfaRequired extends Error {}
// Reusable at application boundaries, including future non-HTTP callers.
// MFA is a prerequisite; it grants no school membership or restricted permission.
export class SessionSecurity {
  constructor(private readonly sessions: SessionSecurityRepository) {}
  execute(credential: string) {
    return this.sessions.findByCredential(credential);
  }
  async requireMfa(credential: string) {
    const state = await this.execute(credential);
    if (!state) throw new AuthenticationRequired();
    if (!state.verified) throw new MfaRequired();
  }
}
