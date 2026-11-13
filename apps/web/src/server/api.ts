import { createServerOnlyFn } from "@tanstack/react-start";
import { createApiClient } from "@soe/api-client";

// Fixed, trusted upstream for this local-only synthetic slice. Never read a host from a request.
export const createServerApi = createServerOnlyFn(() =>
  createApiClient("http://127.0.0.1:43121/api/v1"),
);
