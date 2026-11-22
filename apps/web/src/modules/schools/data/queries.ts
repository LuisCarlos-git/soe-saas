import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import type { ManagedSchoolsQuery } from "@soe/contracts";
export function managedSchoolsQuery(
  api: ApiClient,
  actorId: string,
  options: ManagedSchoolsQuery,
) {
  return queryOptions({
    queryKey: ["managed-schools", actorId, options],
    queryFn: ({ signal }) => api.managedSchools(options, signal),
    retry: false,
  });
}
export function schoolAccessQuery(api: ApiClient, actorId: string) {
  return queryOptions({
    queryKey: ["school-access", actorId],
    queryFn: ({ signal }) => api.schoolAccess(signal),
    staleTime: 0,
    retry: false,
  });
}
export function schoolSettingsQuery(
  api: ApiClient,
  actorId: string,
  organizationId: string,
) {
  return queryOptions({
    queryKey: ["school-settings", organizationId, actorId],
    queryFn: ({ signal }) => api.schoolSettings(organizationId, signal),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
