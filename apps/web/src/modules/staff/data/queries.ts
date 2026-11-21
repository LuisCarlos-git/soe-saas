import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";

export const staffInvitationsKey = (
  actorId: string,
  organizationId: string,
) => ["staff-invitations", actorId, organizationId];
export function staffInvitationsQuery(
  api: ApiClient,
  actorId: string,
  organizationId: string,
  offset: number,
) {
  return queryOptions({
    queryKey: [...staffInvitationsKey(actorId, organizationId), offset],
    queryFn: ({ signal }) => api.invitations(organizationId, offset, signal),
    retry: false,
    refetchInterval: (state) =>
      state.state.data?.invitations.some(
        (invitation) => invitation.status === "PENDING",
      )
        ? 5000
        : false,
  });
}
export function staffSchoolQuery(
  api: ApiClient,
  actorId: string,
  organizationId: string,
) {
  return queryOptions({
    queryKey: ["staff-school", actorId, organizationId],
    queryFn: ({ signal }) => api.schoolSettings(organizationId, signal),
    retry: false,
  });
}
