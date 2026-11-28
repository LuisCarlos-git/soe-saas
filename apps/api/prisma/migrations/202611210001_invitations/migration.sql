ALTER TABLE school_membership ADD COLUMN roles TEXT[] NOT NULL DEFAULT ARRAY['SCHOOL_ADMIN']::TEXT[];
ALTER TABLE school_membership ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE school_membership DROP CONSTRAINT school_membership_role_check;
ALTER TABLE school_membership ADD CONSTRAINT school_membership_role_check CHECK (role IN ('SCHOOL_ADMIN', 'DIRECTION', 'COORDINATION', 'EDUCATIONAL_GUIDANCE', 'TUTOR', 'TEACHER', 'MONITOR'));
ALTER TABLE school_membership ADD CONSTRAINT school_membership_roles_check CHECK (cardinality(roles) BETWEEN 1 AND 7 AND roles <@ ARRAY['SCHOOL_ADMIN', 'DIRECTION', 'COORDINATION', 'EDUCATIONAL_GUIDANCE', 'TUTOR', 'TEACHER', 'MONITOR']::TEXT[]);

CREATE TABLE school_invitation (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES organization(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  "isInitial" BOOLEAN NOT NULL DEFAULT false,
  email TEXT NOT NULL,
  roles TEXT[] NOT NULL CHECK (cardinality(roles) BETWEEN 1 AND 7 AND roles <@ ARRAY['SCHOOL_ADMIN', 'DIRECTION', 'COORDINATION', 'EDUCATIONAL_GUIDANCE', 'TUTOR', 'TEACHER', 'MONITOR']::TEXT[]),
  "tokenHash" TEXT NOT NULL UNIQUE,
  "tokenCiphertext" TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  "createdByUserId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedByUserId" TEXT REFERENCES "user"(id) ON DELETE RESTRICT,
  "revokedAt" TIMESTAMP(3),
  "deliveryStatus" TEXT NOT NULL DEFAULT 'QUEUED' CHECK ("deliveryStatus" IN ('QUEUED','SENT','FAILED')),
  "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3),
  UNIQUE ("organizationId", id),
  CHECK ("expiresAt" > "createdAt")
);
CREATE INDEX "school_invitation_organizationId_createdAt_idx" ON school_invitation("organizationId", "createdAt");
CREATE UNIQUE INDEX school_invitation_pending_email ON school_invitation("organizationId", email) WHERE "acceptedAt" IS NULL AND "revokedAt" IS NULL;
CREATE TABLE invitation_rate_limit (key TEXT PRIMARY KEY, count INTEGER NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL);
