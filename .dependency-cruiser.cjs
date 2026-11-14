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
        path: "^apps/api/|^@soe/api(?:/|$)|^@soe/(backend|database)$|/(@nestjs|@prisma|prisma|pg|pino|better-auth|@better-auth)/",
      },
    },
    {
      name: "packages-no-apps",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "pure-business",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/[^/]+/(domain|repositories|use-cases)/",
      },
      to: {
        path: "node_modules/|^@|packages/contracts/|/(infrastructure|factories|controllers|http|shared)/|[.]module[.]",
      },
    },
    {
      name: "orm-only-infrastructure",
      severity: "error",
      from: {
        path: "^apps/api/src/",
        pathNot: "/(infrastructure|factories|cli)/|[.]module[.]ts$",
      },
      to: { path: "(@prisma|prisma|/pg/)|/infrastructure/database/" },
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
    ...["contracts", "api-client", "ui"].map((name) => ({
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
    exclude: {
      path: "apps/api/src/infrastructure/database/generated/|/routeTree.gen.ts$",
    },
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
