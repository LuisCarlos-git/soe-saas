export interface SessionSecurityState {
  enabled: boolean;
  verified: boolean;
  developmentBypass?: true;
}
export interface SessionSecurityRepository {
  findByCredential(credential: string): Promise<SessionSecurityState | null>;
}
