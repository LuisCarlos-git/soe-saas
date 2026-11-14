export interface EnvironmentRepository {
  read(): Promise<string>;
  ready(): Promise<boolean>;
}
export const ENVIRONMENT_REPOSITORY = Symbol("ENVIRONMENT_REPOSITORY");
