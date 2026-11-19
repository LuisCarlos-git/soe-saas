import { config } from "@soe/eslint-config/base";
import formControls from "./scripts/form-control-boundaries.cjs";
export default [
  ...config,
  {
    files: ["apps/web/src/**/*.ts", "apps/web/src/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@soe/ui",
              importNames: formControls.namedExports,
              message:
                "Consuma os campos conectados de @soe/form via AppField.",
            },
          ],
          patterns: [
            {
              group: [
                ...formControls.primitives.map(
                  (name) => `@soe/ui/primitives/${name}`,
                ),
                ...formControls.components.map(
                  (name) => `@soe/ui/components/${name}`,
                ),
              ],
              message:
                "Controles de formulário vêm de @soe/form. Adicione o adapter ao pacote antes de usá-lo no web.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^(input|textarea|select)$/]",
          message:
            "Use os campos de @soe/form com AppField, em vez de controles HTML avulsos.",
        },
        {
          selector:
            "JSXOpeningElement[name.name=/^(button|Button)$/] > JSXAttribute[name.name='type'][value.value='submit']",
          message:
            "Use form.SubmitButton de @soe/form para acompanhar o envio.",
        },
      ],
    },
  },
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
  {
    files: ["packages/form/src/**/*.ts", "packages/form/src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > :matches(TemplateLiteral, ConditionalExpression, LogicalExpression, BinaryExpression[operator='+'])",
          message: "Use cn() de @soe/ui para compor classes no pacote form.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*.js", "./**/*.js", "../*.js", "../**/*.js"],
              message:
                "Use imports sem extensão no fonte do pacote form; o bundler resolve os artefatos ESM.",
            },
          ],
        },
      ],
    },
  },
];
