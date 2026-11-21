# @soe/form

Composição reutilizável de formulários React, baseada no
[guia oficial do TanStack Form](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition).

Responsabilidade: infraestrutura de formulários do frontend, mantida junto ao
design system. Primeiro consumidor: o login de `@soe/web`. O pacote não conhece
identidade, estudantes, contratos HTTP, transporte ou persistência. Schemas Zod e
ações de negócio pertencem ao módulo consumidor.

## Fronteiras

Regra obrigatória: todos os componentes de formulário consumidos pelo web vêm de
`@soe/form`, incluindo checkbox, textarea, seleção, campos numéricos e envio.
Use `form.AppField` e os componentes registrados em `useAppForm`; ao precisar de
outro controle (por exemplo combobox, data, arquivo ou OTP), implemente e exporte
seu adapter neste pacote antes do uso. Controles HTML avulsos e imports diretos
das primitivas de formulário de UI são bloqueados no web. O elemento HTML `form`,
schemas, opções e ações específicas continuam no módulo consumidor.

`@soe/web → @soe/form → @soe/ui`. O pacote UI mantém os controles visuais shadcn,
tokens, acessibilidade e transições aprovadas. O pacote form conecta esses
controles ao estado do TanStack Form 1.33.5. UI não importa form; form não importa
apps, contracts, api-client ou backend. O CI verifica essas fronteiras e impede
acesso a arquivos internos.

Exports públicos:

- `@soe/form`: `useAppForm`, `withForm`, `withFieldGroup`, `formOptions`,
  os campos da tabela abaixo, `SubmitButton`, seus tipos de props e helpers de validação.
- `@soe/form/context`: `fieldContext`, `formContext`, `useFieldContext` e
  `useFormContext`, para extensões de campo que compartilhem os mesmos contextos.

Não crie novos contextos em cada módulo. Os dois entrypoints são compilados com
splitting para manter uma instância compartilhada, inclusive em SSR. Os imports
do fonte são sem extensão; os artefatos são ESM compilados, com declarações.

## Uso

| Campo                            | Valor controlado                               |
| -------------------------------- | ---------------------------------------------- |
| TextField (texto, e-mail, senha) | string                                         |
| TextareaField                    | string                                         |
| CheckboxField e SwitchField      | boolean                                        |
| CheckboxGroupField               | string[]; opções selecionadas sem repetição    |
| SelectField e NativeSelectField  | string; vazio representa ausência de seleção   |
| RadioGroupField                  | string                                         |
| NumberField                      | number ou null quando vazio; zero é preservado |

Todos associam label, ajuda e erro ao controle, assinam seu estado e validam
change/blur/submit com a estratégia compartilhada. As opções de seleção recebem
uma lista de `ChoiceOption` com value, label e disabled opcional. CheckboxField
é booleano, sem converter o estado indeterminado da primitiva em true. NumberField
não converte ausência em zero nem envia NaN. IDs gerados preservam SSR e permitem
múltiplos formulários na mesma página.

TextField e SubmitButton são síncronos para preservar o SSR e a prontidão do login.
Os demais campos usam React.lazy com Suspense interno e fallback textual; seus
adapters e primitivas são carregados quando montados. O consumidor usa a mesma
API e não precisa criar boundaries próprios. Isso segue a seção de tree-shaking
do guia do TanStack, sem carregar o catálogo inteiro na entrada da aplicação.

Defina as opções no módulo consumidor. Schemas reutilizam os contratos de entrada
quando existirem; adapte mensagens de apresentação sem duplicar regras.

```tsx
import {
  formOptions,
  useAppForm,
  validateOnChangeAndBlur,
  withForm,
} from "@soe/form";
import { z } from "zod";

const exampleOptions = formOptions({
  defaultValues: { title: "" },
  validationLogic: validateOnChangeAndBlur,
  validators: {
    onChange: z.object({ title: z.string().min(1, "Informe o título.") }),
  },
});

const ExampleFields = withForm({
  ...exampleOptions,
  render: function ExampleFields({ form }) {
    return (
      <form.AppField name="title">
        {(field) => <field.TextField label="Título" required />}
      </form.AppField>
    );
  },
});

export function Example({
  save,
}: {
  save: (value: { title: string }) => Promise<void>;
}) {
  const form = useAppForm({
    ...exampleOptions,
    onSubmit: ({ value }) => save(value),
  });
  return (
    <form.AppForm>
      <form
        noValidate
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <ExampleFields form={form} />
        <form.SubmitButton>Salvar</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
```

`AppForm` fornece o contexto; o elemento HTML `form` continua explícito.
`AppField` preserva os nomes tipados; `TextField` conecta valor string, change,
blur e mensagens por assinaturas `useSelector`. O mesmo campo atende texto,
e-mail e senha. Use `withForm` para extrair trechos sem perder a inferência e
`withFieldGroup` quando houver um grupo realmente reutilizado. Campos de tipos
diferentes devem ter adapters próprios, usando `@soe/form/context`.

`SubmitButton` assina `isSubmitting` e usa o Button de UI: ação desabilitada
durante envio, nome acessível preservado e transição de texto/spinner existente.
Outros bloqueios, como aguardar hidratação, entram pela prop `disabled`. Não
desabilite por `canSubmit`: a tentativa inválida precisa revelar os campos.

## Validação e feedback

`validateOnChangeAndBlur` aplica o schema de `validators.onChange` também no blur;
o submit nativo do TanStack executa esse mesmo validador para todos os campos.
Um único canal evita manter erros de blur depois de corrigir o valor. Preserve o
retorno de `defaultValidationLogic`, necessário em runtime na versão instalada.

As mensagens aparecem quando o campo está touched. Change e blur tocam o campo;
submit toca todos, inclusive os ainda vazios. O formatter aceita strings e issues
com message, remove duplicatas e ignora valores desconhecidos sem convertê-los em
texto. Não há estado global de formulário, sessão ou schema neste pacote.

Erros de transporte continuam no Sonner global do web. O pacote não faz fetch nem
decide autorização. Não persista relatos ou senhas em armazenamento do navegador.

## Verificação

- `pnpm --filter @soe/form build` e `pnpm --filter @soe/form typecheck`.
- `pnpm --filter @soe/form test:browser`: todos os adapters em prévia isolada,
  teclado, valores tipados, reset, instâncias independentes, disabled e Axe em
  desktop e celular. A suíte também integra `pnpm test:e2e` do workspace.
- `composition.spec.ts` consome os exports públicos de `@soe/form` e
  `@soe/form/context`: cobre `withForm`, validação no blur/change/submit,
  mensagens acessíveis e `SubmitButton` durante a promessa do consumidor, sem
  backend ou banco. A prova atravessa a mesma interface usada pelo login.
- `pnpm test:unit`: formatter público de mensagens, incluindo deduplicação e
  resultados desconhecidos. Os testes da estratégia foram substituídos pelos
  cenários de composição React, que também verificam sua ligação aos campos.
- `pnpm architecture:check`: neutralidade e proibição de imports internos.
- As jornadas do login preservam layout e acessibilidade, ligação do schema de
  login à submissão e resposta da autenticação no toast. As regras específicas
  de e-mail/senha continuam nos testes do módulo identity; os cenários genéricos
  de campos pertencem ao pacote form.

As skills de UI e a base `DESIGN.md` orientam a apresentação. Este pacote reutiliza
os componentes e as transições existentes; não introduz outra identidade visual
nem um motor de animação.

### Espaço para erros em formulários compactos

`TextField`, `NumberField` e `NativeSelectField` aceitam
`reserveErrorSpace={false}` para recolher o espaço das mensagens quando não há
erro. O padrão preserva a reserva existente. O formulário escolar usa essa opção,
com labels e alvos de 44 px mantidos. `FieldMessage` conserva a mensagem durante
a saída; o recolhimento usa a receita grid de Transitions.dev e respeita
`prefers-reduced-motion`. A opção equivalente na primitiva UI é
`FieldMessage reserveSpace={false}`.
