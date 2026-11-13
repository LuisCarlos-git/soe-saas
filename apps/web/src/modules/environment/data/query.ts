import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";

export const environmentQuery = (client: ApiClient) =>
  queryOptions({
    queryKey: ["synthetic-environment"],
    queryFn: ({ signal }) => client.environment(signal),
    retry: false,
  });
