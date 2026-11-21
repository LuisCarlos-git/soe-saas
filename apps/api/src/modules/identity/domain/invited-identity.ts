export type InvitedIdentityInput = {
  email: string;
  name: string;
  encodedPassword: string;
};
export class InvitedIdentityAlreadyExists extends Error {}
