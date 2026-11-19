export interface Environment {
  status: "ok";
  sample: string;
}
export class EnvironmentUnavailable extends Error {}
