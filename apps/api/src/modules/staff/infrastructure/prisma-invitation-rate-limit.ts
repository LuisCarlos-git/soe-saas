import { createHmac } from "node:crypto";
import type { ThrottlerStorage } from "@nestjs/throttler";
import type { Database } from "../../../infrastructure/database/database.factory";

export class PrismaInvitationRateLimit implements ThrottlerStorage {
  constructor(
    private readonly db: Database,
    private readonly secret: string,
  ) {}
  async increment(inputKey: string, ttl: number, limit: number) {
    const key = createHmac("sha256", this.secret)
      .update(`invitation-rate:${inputKey}`)
      .digest("hex");
    const [row] = await this.db.$queryRaw<
      { count: number; remaining: number }[]
    >`
      INSERT INTO invitation_rate_limit (key, count, "expiresAt")
      VALUES (${key}, 1, CURRENT_TIMESTAMP + (${ttl}::text || ' milliseconds')::interval)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN invitation_rate_limit."expiresAt" <= CURRENT_TIMESTAMP THEN 1 ELSE LEAST(invitation_rate_limit.count + 1, ${limit + 1}) END,
        "expiresAt" = CASE WHEN invitation_rate_limit."expiresAt" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + (${ttl}::text || ' milliseconds')::interval ELSE invitation_rate_limit."expiresAt" END
      RETURNING count, GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("expiresAt" - CURRENT_TIMESTAMP))))::integer AS remaining
    `;
    if (!row) throw new Error("Invitation rate limit unavailable");
    return {
      totalHits: row.count,
      timeToExpire: row.remaining,
      isBlocked: row.count > limit,
      timeToBlockExpire: row.count > limit ? row.remaining : 0,
    };
  }
}
