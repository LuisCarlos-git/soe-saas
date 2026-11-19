import { toast } from "@soe/ui";
import type { ApiError } from "@soe/api-client";

export function notifyApiError(error: ApiError) {
  // One stable toast per safe error code; retries do not stack identical notices.
  toast.error(error.message, { id: `api-error:${error.code}` });
}
