import type { InvitedIdentityInput } from "../domain/invited-identity";
export interface InvitedIdentityRepository {
  exists(email: string): Promise<boolean>;
  create(input: InvitedIdentityInput): Promise<string>;
}
