import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
function check(paths) {
  return spawnSync(
    "node_modules/.bin/depcruise",
    ["--config", ".dependency-cruiser.cjs", "--output-type", "err", ...paths],
    { encoding: "utf8" },
  );
}
const production = check([
  "apps/api/src",
  "apps/web/src",
  "packages/contracts/src",
  "packages/api-client/src",
  "packages/ui/src",
]);
process.stdout.write(production.stdout);
process.stderr.write(production.stderr);
if (production.status !== 0) process.exit(1);
const fixtures = [
  {
    path: "apps/web/src/architecture-negative.ts",
    source:
      "import { createApi } from '../../api/src/app.js'; console.log(createApi);",
    rule: "web-no-server",
  },
  {
    path: "apps/api/src/modules/environment/use-cases/architecture-negative.ts",
    source: "import { Module } from '@nestjs/common'; console.log(Module);",
    rule: "pure-business",
  },
  {
    path: "apps/api/src/modules/identity/repositories/architecture-negative.ts",
    source:
      "import { createDatabase } from '../../../infrastructure/database/database.factory.js'; console.log(createDatabase);",
    rule: "pure-business",
  },
  {
    path: "apps/api/src/modules/environment/controllers/architecture-negative.ts",
    source:
      "import { createDatabase } from '../../../infrastructure/database/database.factory.js'; console.log(createDatabase);",
    rule: "orm-only-infrastructure",
  },
  {
    path: "packages/contracts/src/architecture-negative.ts",
    source:
      "import { createApi } from '../../../apps/api/src/app.js'; console.log(createApi);",
    rule: "packages-no-apps",
  },
];
for (const fixture of fixtures) {
  try {
    writeFileSync(fixture.path, fixture.source);
    const result = check([fixture.path]);
    if (result.status === 0 || !result.stdout.includes(fixture.rule))
      throw new Error(
        `Architecture failed to reject ${fixture.rule}: ${result.stdout} ${result.stderr}`,
      );
    console.log(`Negative fixture rejected: ${fixture.rule}.`);
  } finally {
    unlinkSync(fixture.path);
  }
}
