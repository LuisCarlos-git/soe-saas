const { readdirSync } = require("node:fs");
const webModules = readdirSync("apps/web/src/modules", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

module.exports = {
  forbidden: [
    {
      name: "no-cycles",
      severity: "error",
      from: {},
      to: { circular: true, dependencyTypesNot: ["type-only"] },
    },
    {
      name: "web-no-server",
      severity: "error",
      from: { path: "^apps/web/src/" },
      to: {
        path: "^@soe/(backend|database)$|packages/(backend|database)/|/(@nestjs|@prisma|prisma|pg|pino)/",
      },
    },
    {
      name: "packages-no-apps",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "api-no-database",
      severity: "error",
      from: { path: "^apps/api/src/" },
      to: { path: "^@soe/database$|packages/database/|/(@prisma|prisma|pg)/" },
    },
    {
      name: "pure-business",
      severity: "error",
      from: {
        path: "^packages/backend/src/(modules/[^/]+/(domain|application)|shared/(domain|application))/",
      },
      to: {
        path: "(node_modules/|packages/(database|contracts)/|/(infrastructure|composition)/)",
      },
    },
    {
      name: "neutral-ui",
      severity: "error",
      from: { path: "^packages/ui/" },
      to: {
        path: "^@soe/(backend|database|contracts|api-client)$|^apps/|^packages/(backend|database|contracts|api-client)/",
      },
    },
    {
      name: "neutral-contracts",
      severity: "error",
      from: { path: "^packages/(contracts|api-client)/" },
      to: {
        path: "^@soe/(backend|database|ui)$|^apps/|^packages/(backend|database|ui)/|/(@nestjs|@prisma|prisma|react|pg)/",
      },
    },
    ...[
      "backend",
      "database",
      "contracts",
      "api-client",
      "ui",
      "test-utils",
    ].map((name) => ({
      name: `no-${name}-internals`,
      severity: "error",
      from: { path: "^(apps|packages)/", pathNot: `^packages/${name}/` },
      to: {
        path: `^packages/${name}/(src|dist)/`,
        pathNot: `^packages/${name}/(src|dist)/index[.]`,
      },
    })),
    {
      name: "apps-no-other-apps",
      severity: "error",
      from: { path: "^apps/api/" },
      to: { path: "^apps/web/" },
    },
    ...webModules.flatMap((name) => [
      {
        name: `isolated-web-${name}`,
        severity: "error",
        from: { path: `^apps/web/src/modules/${name}/` },
        to: {
          path: "^apps/web/src/modules/",
          pathNot: `^apps/web/src/modules/${name}/`,
        },
      },
      {
        name: `pure-model-${name}`,
        severity: "error",
        from: { path: `^apps/web/src/modules/${name}/model/` },
        to: { path: `^apps/web/src/modules/${name}/(ui|data)/` },
      },
    ]),
    {
      name: "generic-shared",
      severity: "error",
      from: { path: "^apps/web/src/shared/" },
      to: { path: "^apps/web/src/modules/" },
    },
  ],
  options: {
    exclude: { path: "packages/database/src/generated/|/routeTree.gen.ts$" },
    doNotFollow: { path: "node_modules|/dist/" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      conditionNames: ["import", "types", "default"],
      exportsFields: ["exports"],
    },
  },
};
