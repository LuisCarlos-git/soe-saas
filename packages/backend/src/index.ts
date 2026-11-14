export {
  ReadEnvironment,
  EnvironmentUnavailable,
} from "./modules/environment/public.js";
export type { EnvironmentProbe } from "./modules/environment/public.js";
export {
  EnvironmentModule,
  ENVIRONMENT_PROBE,
} from "./modules/environment/composition/environment.module.js";
export { parseConfiguration } from "./platform/config.js";
export { httpLoggerOptions } from "./platform/logging.js";

export { createAuthentication } from "./modules/identity/infrastructure/authentication.js";
export { CurrentIdentity } from "./modules/identity/public.js";
export {
  provisionTestIdentities,
  provisionDevelopmentIdentities,
} from "./modules/identity/infrastructure/test-identities.js";
