ALTER TABLE "user" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "session" ADD COLUMN "mfaVerified" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "twoFactor" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "secret" TEXT NOT NULL, "backupCodes" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT true, "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3)
);
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");
CREATE FUNCTION audit_mfa_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'user' THEN
    IF NEW."twoFactorEnabled" IS DISTINCT FROM OLD."twoFactorEnabled" THEN
      INSERT INTO authentication_audit (id, "userId", action) VALUES
        (gen_random_uuid()::text, NEW.id, CASE WHEN NEW."twoFactorEnabled" THEN 'MFA_ENABLED' ELSE 'MFA_DISABLED' END);
    END IF;
  ELSE
    IF NEW."mfaVerified" AND NOT OLD."mfaVerified" THEN
      INSERT INTO authentication_audit (id, "userId", action) VALUES (gen_random_uuid()::text, NEW."userId", 'MFA_VERIFIED');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER user_mfa_audit AFTER UPDATE OF "twoFactorEnabled" ON "user" FOR EACH ROW EXECUTE FUNCTION audit_mfa_change();
CREATE TRIGGER session_mfa_audit AFTER UPDATE OF "mfaVerified" ON "session" FOR EACH ROW EXECUTE FUNCTION audit_mfa_change();
