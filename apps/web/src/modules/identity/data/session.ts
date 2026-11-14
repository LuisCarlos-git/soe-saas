import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
export function sessionQuery(api: ApiClient) {
  return queryOptions({
    queryKey: ["identity", "current-session"],
    queryFn: ({ signal }) => api.identity(signal),
    staleTime: 0,
    retry: false,
  });
}
