import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createApiClient } from "@soe/api-client";

// New client per SSR request, forwarding only the provider's session cookie.
export const createServerApi = createServerOnlyFn(() => {
  const cookie = (getRequestHeader("cookie") ?? "")
    .split(";")
    .map((value) => value.trim())
    .filter((value) => /^(?:__Secure-)?soe\.session_token=/.test(value))
    .join("; ");
  return createApiClient("http://127.0.0.1:43121/api/v1", fetch, cookie);
});
