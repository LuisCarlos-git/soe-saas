import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs";

const binary = "node_modules/.bin/depcruise";
function check(paths) {
  return spawnSync(
    binary,
    ["--config", ".dependency-cruiser.cjs", "--output-type", "err", ...paths],
    { encoding: "utf8" },
  );
}
const production = check([
  "apps/api/src",
  "apps/web/src",
  "packages/backend/src",
  "packages/database/src/index.ts",
  "packages/contracts/src",
  "packages/api-client/src",
  "packages/ui/src",
]);
process.stdout.write(production.stdout);
process.stderr.write(production.stderr);
if (production.status !== 0) process.exit(1);
const folder = "apps/web/src/architecture-negative-fixture";
mkdirSync(folder);
try {
  writeFileSync(
    `${folder}/forbidden.ts`,
    "import { EnvironmentModule } from '@soe/backend'; console.log(EnvironmentModule);\n",
  );
  const negative = check([`${folder}/forbidden.ts`]);
  if (negative.status === 0 || !negative.stdout.includes("web-no-server")) {
    console.error(
      "Architecture negative test did not reject a backend import.",
      negative.stdout,
      negative.stderr,
    );
    process.exitCode = 1;
  } else console.log("Negative fixture rejected: web-no-server.");
} finally {
  unlinkSync(`${folder}/forbidden.ts`);
  rmdirSync(folder);
}

const pureFixture =
  "packages/backend/src/modules/environment/application/architecture-negative-fixture.ts";
try {
  writeFileSync(
    pureFixture,
    "import { Module } from '@nestjs/common'; console.log(Module);\n",
  );
  const result = check([pureFixture]);
  if (result.status === 0 || !result.stdout.includes("pure-business"))
    throw new Error("Pure application imported Nest without rejection.");
  console.log("Negative fixture rejected: pure-business.");
} finally {
  unlinkSync(pureFixture);
}

const internalFixture = "apps/api/src/architecture-negative-fixture.ts";
try {
  writeFileSync(
    internalFixture,
    "import { parseConfiguration } from '../../../packages/backend/src/platform/config.js'; console.log(parseConfiguration);\n",
  );
  const result = check([internalFixture]);
  if (result.status === 0 || !result.stdout.includes("no-backend-internals"))
    throw new Error("Cross-package internal import was not rejected.");
  console.log("Negative fixture rejected: no-backend-internals.");
} finally {
  unlinkSync(internalFixture);
}
