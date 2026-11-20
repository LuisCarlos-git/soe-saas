CREATE TABLE saas_operator (
  "userId" TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE RESTRICT,
  enabled BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE organization (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "timeZone" TEXT NOT NULL,
  "academicYear" INTEGER NOT NULL CHECK ("academicYear" BETWEEN 2000 AND 2100),
  "supportTeamLabel" TEXT NOT NULL,
  "studentLabel" TEXT NOT NULL,
  "classLabel" TEXT NOT NULL,
  "initialAdministratorId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  "pilotStatus" TEXT NOT NULL DEFAULT 'SYNTHETIC_ONLY' CHECK ("pilotStatus" = 'SYNTHETIC_ONLY'),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE school_membership (
  "organizationId" TEXT NOT NULL REFERENCES organization(id) ON DELETE RESTRICT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role = 'SCHOOL_ADMIN'),
  active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("organizationId", "userId")
);
CREATE INDEX "school_membership_userId_active_idx" ON school_membership("userId", active);
CREATE TABLE school_audit (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES organization(id) ON DELETE RESTRICT,
  "actorId" TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "school_audit_organizationId_occurredAt_idx" ON school_audit("organizationId", "occurredAt");
