export interface SessionSecurityState {
  enabled: boolean;
  verified: boolean;
}
export interface SessionSecurityRepository {
  findByCredential(credential: string): Promise<SessionSecurityState | null>;
}
