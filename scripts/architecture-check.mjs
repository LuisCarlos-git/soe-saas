import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { ESLint } from "eslint";
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
  "packages/form/src",
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
  {
    path: "packages/form/src/architecture-negative.ts",
    source:
      "import { loginSchema } from '@soe/contracts'; console.log(loginSchema);",
    rule: "neutral-form",
  },
  {
    path: "apps/web/src/architecture-negative.ts",
    source:
      "import { TextField } from '../../../packages/form/src/components/text-field'; console.log(TextField);",
    rule: "no-form-internals",
  },
  {
    path: "apps/web/src/architecture-negative.ts",
    source:
      "import { Checkbox } from '@soe/ui/primitives/checkbox'; console.log(Checkbox);",
    rule: "web-form-controls-from-package",
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

const eslint = new ESLint();
for (const fixture of [
  {
    source: "import { Input } from '@soe/ui'; console.log(Input);",
    rule: "no-restricted-imports",
  },
  {
    source:
      "import { Textarea } from '@soe/ui/primitives/textarea'; console.log(Textarea);",
    rule: "no-restricted-imports",
  },
  {
    source: "const field = <input />; console.log(field);",
    rule: "no-restricted-syntax",
  },
  {
    source: "const field = <textarea />; console.log(field);",
    rule: "no-restricted-syntax",
  },
  {
    source:
      "const button = <button type='submit'>Enviar</button>; console.log(button);",
    rule: "no-restricted-syntax",
  },
  {
    source: "import { useAppForm } from '@soe/form'; console.log(useAppForm);",
    rule: undefined,
  },
]) {
  const [result] = await eslint.lintText(fixture.source, {
    filePath: "apps/web/src/form-boundary-fixture.tsx",
  });
  const matches = result?.messages.some(
    (message) => message.ruleId === fixture.rule,
  );
  if (
    !result ||
    (fixture.rule && !matches) ||
    (!fixture.rule && result.errorCount)
  ) {
    throw new Error(
      `Form boundary fixture failed: ${JSON.stringify(result?.messages)}`,
    );
  }
}
console.log(
  "Form control lint fixtures: rejected direct controls and accepted @soe/form.",
);
