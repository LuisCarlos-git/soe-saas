import { createRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createApiClient } from "@soe/api-client";
import { createServerApi } from "./server/api";
import { notifyApiError } from "./shared/api-errors";
import { routeTree } from "./routeTree.gen";

const createClient = createIsomorphicFn()
  .server(() => createServerApi())
  .client(() => createApiClient("/api/v1", fetch, undefined, notifyApiError));

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 10_000 } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient, api: createClient() },
    scrollRestoration: true,
    defaultViewTransition: false,
  });
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
