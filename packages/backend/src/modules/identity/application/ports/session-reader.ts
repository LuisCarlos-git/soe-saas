import type { Identity } from "../models/identity.js";
export interface SessionReader {
  read(credential: string): Promise<Identity | null>;
}
