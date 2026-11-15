import { config } from "@soe/eslint-config/base";
export default [
  ...config,
  {
    files: ["packages/ui/src/**/*.tsx", "packages/ui/src/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > :matches(TemplateLiteral, ConditionalExpression, LogicalExpression, BinaryExpression[operator='+'])",
          message: "Use cn() de #lib/utils para compor classes no pacote UI.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*.js", "./**/*.js", "../*.js", "../**/*.js"],
              message:
                "Use imports sem extensão no fonte do pacote UI; o bundler resolve os artefatos ESM.",
            },
          ],
        },
      ],
    },
  },
];
