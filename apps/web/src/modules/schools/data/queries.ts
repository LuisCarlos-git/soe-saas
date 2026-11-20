import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
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
