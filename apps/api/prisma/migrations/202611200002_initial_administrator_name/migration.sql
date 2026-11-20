ALTER TABLE organization ADD COLUMN "initialAdministratorName" TEXT;
UPDATE organization AS school
SET "initialAdministratorName" = identity.name
FROM "user" AS identity
WHERE identity.id = school."initialAdministratorId";
ALTER TABLE organization ALTER COLUMN "initialAdministratorName" SET NOT NULL;
