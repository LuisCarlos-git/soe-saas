CREATE TABLE "environment_probe" (
  "id" TEXT PRIMARY KEY CHECK ("id" = 'bootstrap'),
  "sample" TEXT NOT NULL CHECK ("sample" = 'SOE: ambiente de desenvolvimento validado.')
);
INSERT INTO "environment_probe" ("id", "sample")
VALUES ('bootstrap', 'SOE: ambiente de desenvolvimento validado.');
